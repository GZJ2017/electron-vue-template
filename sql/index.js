const initSqlJs  = require('sql.js');
const fs = require('fs');
const path = require('path');
const Format = require('./Format.js');


class Db extends Format {
	static instance = null;
	constructor(options = {}){
		super(options);
		this.options = Object.assign({
			database: path.join(__dirname, './data/db.sqlite')
		}, options);

		// 存储数据库表名 和 对应创建表的数据库语句
		this.tableNames = [
			this.createUserInfoTable(),
			this.createFileTable(),
			this.createGeneralTable()
		];
	}
	initDatabase(){
		return new Promise((resolve, reject) => {
			fs.stat(this.options.database, async err => {
				const SQL = await initSqlJs();
				if(err && err.code == 'ENOENT') {
					// 如果本地不存在该数据库则初始化
					let db = new SQL.Database();
					this.tableNames.forEach(item => db.run(item.sql));
					// 将数据库写入本地文件
					fs.writeFile(this.options.database, db.export(), err => {
						if(err) reject({msg:'写入文件失败'});
						db.close();
						resolve({msg:'创建数据成功'});
					})
				} else {
					// 如果存在该数据库则进行数据库同步
					let tables = await this.getAllTable();
					for(let table of this.tableNames){
						if(!tables.some(t=>t.name === table.name)){
							await this.query(table.sql);
						}else {
							let field = await this.getTableFieldName(table.name);
							let { newField, oldField } = this.diff(field, [...table.field]);
							if(newField.length) {
								// 执行表的字段增加 
								await this.tableAddField(table.name, newField.reduce((a,b)=>({
									[b]: table.data[b]
								}), {}));
							}
							if(oldField.length){
								// 执行表的字段删除
								await this.deleteField(table.name);
							}
						}
					}
					resolve({msg:'同步数据成功'});
					// 删除多余的表格
					let { oldField } = this.diff(tables.map(t=>t.name), this.tableNames.map(t => t.name));
					oldField.forEach(async t=>{
						await this.deleteTable(t);
					})
					
				}
			})
		});
	}
	async openDatabase(){
		// 读取本地数据库文件
		const dataDbFile = fs.readFileSync(this.options.database);
		// 初始化数据库
		const SQL = await initSqlJs({});
		// 创建数据库实例
		return new SQL.Database(dataDbFile);
	}
	// 执行sql语言
	async query(sql, data = []){
		const db = await this.openDatabase();
		let res = db.run(sql, data);
		fs.writeFileSync(this.options.database, db.export());
		res.close();
		return res;
	}
	// 查询数据
	async select(sql){
		const db = await this.openDatabase();
		let res = db.exec(sql);
		db.close();
		if(res.values().next().value){
			return this.formatSelectData(res.values().next().value);
		} else {
			// 如果没有查询到数据则返回空数组
			return [];
		}
	}
	/**
	 * 条件查询，如果不传条件则查询该表的所有数据
	 * @param  {String} table 表名
	 * @param  {Object} data  条件
	 * @return {Object}       查询结果
	 */
	async selectWhere(table, data = {}){
		data = this.formatWhereData(data);
		const SELECT_SQL = `SELECT * FROM ${table} ${data? 'WHERE ' + data: ''}`;
		return await this.select(SELECT_SQL);
	}
	/**
	 * 对某个表的数据进行分页查询
	 * @param  {String} table 	需要查询的表名
	 * @param  {Number} page  	查询的页数
	 * @param  {Number} num   	每一页数据的条数
	 * @return {Array}       	查询的结果
	 */
	async pagingSelect(table, page = 1, num = 10){
		const SELECT_SQL = `SELECT * FROM ${table} LIMIT ${(page-1) * num}, ${num}`;
		return await this.select(SELECT_SQL)
	}
	/**
	 * 将数据插入到对于的表中
	 * @param  {Sting} table 			需要插入数据的表名
	 * @param  {Object | Array} data  	需要插入的具体数据 对象key, val形式 也可以是数组形式一次插入多条数据
	 *                        			对象的key值必须是所需插入表的字段名
	 *                           		对象的val值只能是字符形式表示该字段的对应的值
	 * @return {Object}       			返回执行之后的数据结果
	 */
	async insert(table, data){
		let INSERT_SQL = '';
		if(this.isString(table)){
			if(this.isObject(data)){
				data = this.formatData(data);
				INSERT_SQL = `INSERT INTO ${table} (${data.key}) values(${data.val})`;
			}
			if(this.isArray(data)){
				let key = Object.keys(data[0]).join(),
					content = data.map(item =>`(${this.formatData(item).val})`).join()
				INSERT_SQL = `INSERT INTO ${table} (${key}) values${content}`;
			}
			return this.query(INSERT_SQL);
		}
	}
	/**
	 * 删除指定表中的数据数据，如果不传条件对象则删除整个表的数据
	 * @param  {String} table 	需要删除数据的表
	 * @param  {Object} whe   	指定的条件 (该条件支持多个,只支持等于类的条件，其他大于小于或者是其他复杂条件不支持)
	 * @return {[type]}       [description]
	 */
	async delete(table, whe = {}){
		if(this.isString(table)){
			let DELETE_SQL = `DELETE FROM ${table} WHERE ${this.formatWhereData(whe)}`;
			return this.query(DELETE_SQL);
		}
	}
	/**
	 * 更新数据库中指定表的对于数据
	 * @param  {String} table 	数据库表名
	 * @param  {Object} whe   	跟新的条件(只支持相等的条件，其他条件不支持)
	 * @param  {Object} data  	需要跟新的字段
	 * @return {[type]}       [description]
	 */
	async update(table, whe = {}, data = {}){
		let UPDATE_SQL = `UPDATE ${table} SET ${this.formatWhereData(data, ', ')} where ${this.formatWhereData(whe)}`
		return this.query(UPDATE_SQL);
	}
	/**
	 * 创建表，如果该表以存在则不创建
	 * @param  {String} tableName 	数据库表名
	 * @param  {Object} data      	表名的字段及字段约束
	 * @return {[type]}           [description]
	 */
	async createTable(tableName, data) {
		const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${this.formatCreateTableData(data)})`;
		return this.query(CREATE_TABLE_SQL);
	}
	/**
	 * 获取数据库中所有的表名
	 * @return {Array} 所有表名组成的数组
	 */
	async getAllTable(){
		let res = await this.select(`SELECT name FROM sqlite_master WHERE type='table'`);
		return res;
	}
	/**
	 * 向创建的表中添加字段，注意：只能添加字段，添加之后的字段不能删除，除非重新建表
	 * @param  {String} table 需要插入字段的表格名
	 * @param  {Object} field 需要插入的字段名及字段约束
	 * @return {[type]}       [description]
	 */
	async tableAddField(table, field = {}){
		let res = await this.query(`ALTER TABLE ${table} ADD ${this.formatCreateTableData(field)}`);
		return res;
	}
	/**
	 * 删除数据中的指定表, 注意：删除表将会删除表中所有数据
	 * @param  {String} table 	需要删除的数据库表名
	 * @return {[type]}       	[description]
	 */
	async deleteTable(table){
		let res = await this.query(`DROP TABLE ${table}`);
		return res;
	}
	/**
	 * 清空表：把表中的所有数据都删除，表任然存在
	 * @param  {String} table 	需要清空表的表名
	 * @return {[type]}       	[description]
	 */
	async emptyTable(table){
		let res = await this.query(`TRUNCATE TABLE ${table}`);
		return res;
	}
	/**
	 * 修改表的名字
	 * @param  {String} oldName 旧的表名
	 * @param  {String} newName 新的表名
	 * @return {[type]}         [description]
	 */
	async updateTableName(oldName, newName){
		const SQL = `ALTER TABLE ${oldName} RENAME TO ${newName}`;
		return await this.query(SQL);
	}
	/**
	 * 删除表中的字段
	 * @param  {String} table    表名
	 * @return {[type]}          [description]
	 */
	async deleteField(table){
		const db = await this.openDatabase();
		let newTable = this.tableNames.filter(t=>t.name === table)[0];
		let res = db.run(`ALTER TABLE ${table} RENAME TO temp_table;`);
		res = db.run(`CREATE TABLE ${table} (${this.formatCreateTableData(newTable.data)});`)
		res = db.run(`INSERT INTO ${table} (${newTable.field.join()}) SELECT ${newTable.field.join()} FROM temp_table;`);
		res = db.run(`DROP TABLE temp_table;`);
		fs.writeFileSync(this.options.database, db.export());
		res.close();
		return res;
	}
	/**
	 * 获取指定表名的所有字段名
	 * @param  {String} table 表名
	 * @return {Array}       该表的字段名数组
	 */
	async getTableFieldName(table){
		let res = await this.select(`PRAGMA table_info("${table}")`);
		return res.map(ele => ele.name);
	}
	createTableSql(tableName, data) {
		return {
			name: tableName,
			sql: `CREATE TABLE ${tableName} (${this.formatCreateTableData(data)})`,
			field: Object.keys(data),
			data
		}
	}
	// 创建用户信息表
	createUserInfoTable(){
		return this.createTableSql('user_info', {
			username: 'varchar(20)',
			uppassword: 'varchar(32)',
			token: 'text',
			isChecked: 'integer',
			phoneNumber: 'varchar(11)',
			isAutoLogin: 'integer',
			startTime: 'timestamp',
			endTime: 'timestamp'
		});
	}
	// 创建文件表
	createFileTable(){
		return this.createTableSql('file', {
			mid: 'varchar(32)',
			uuid: 'varchar(50)',
			filePath: 'text',
			fileName: 'varchar(255)',
			state: 'varchar(20)',
			createTime: 'timestamp',
			compeleteTime: 'timestamp'
		});
	}
	// 创建通用信息表
	createGeneralTable(){
		return this.createTableSql('general', {
			isCutShow: 'integer',
			winWidth: 'integer', 			// 窗口宽度
			winHeight: 'integer', 			// 窗口高度
			versionsContrast: 'integer',	// 版本对比
			moreVideoGuide: 'integer'
		})
	}

}

const db = new Db({
	database: path.join(__dirname, './data/db.sqlite')
});

	

	// 如果需要保证执行顺序
	(async () => {

		await db.initDatabase();

		// await db.deleteTable('temp_table');
		
		// db.update('user_info', {
		// 	username: '13397518026'
		// }, {
		// 	isChecked: 1
		// })

		let res = await db.getTableFieldName("user_info");
		console.log(res);
		// let data = await db.select(`select * from user_info`);
		// console.log(data);
		
		// await db.updateTableName('file', 'fileNames')

		let table = await db.getAllTable()
		console.log(table);
		// let ta = await db.deleteField('user_info', 'phoneNumber')
		// let ts = db.tableAddField('user_info', {
		// 	abc: 'text'
		// });
		// console.log(ts);
		// let table = await db.getAllTable()
		// console.log(table);
		// let arr = [];
		// for(var i = 0; i<1000; i++){
		// 	arr.push({
		// 		msg: '消费记录：'+ (Math.random()*100).toFixed(2),
		// 		user_id: 1234567+i,
		// 		username: 'wanglas'
		// 	})
		// }
		// await db.insert('message_list', arr);
		// console.log(arr);
		// await db.insert('message_list', );
		// 删除数据中 id = 3 的数据
		// let dl = await db.delete('message_list', {
		// 	id: 1
		// });
		// await db.update('message_list', {
		// 	id: 2
		// }, {
		// 	msg: '6666666666666666666666666666666666666',
		// 	username: 'liting'
		// })
		// console.log(dl);
		// let res = await db.pagingSelect("message_list", 0, 1000);
		// console.log(res);

		// console.log(res);
		// let res2 = await db.select(`select * from userTable`);
		// console.log(res2.values().next().value);
		// console.log(res);
		// let data = await db.createTable('test', {
		// 	username: 'varchar(20)',
		// 	uppassword: 'varchar(32)',
		// 	token: 'text',
		// 	isChecked: 'integer',
		// 	phoneNumber: 'varchar(11)',
		// 	isAutoLogin: 'integer',
		// 	startTime: 'timestamp',
		// 	endTime: 'timestamp'
		// });

		// await db.insert('user_info', {
		// 	username: '13397518026',
		// 	uppassword: '4bbfbc93cf9e664a693a83733222e0f5',
		// 	token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJjb21wYW55SWQiOiJhMWE0YTUxMzgyMTExMWU5OWM3ZTdjZDMwYWQzYTZhOCIsImdlbmRlciI6IjEiLCJvcGVuSWQiOiIwMHB0Ym5kMTQwNjI1NzE5MjE1OTk0NDQyMDM2MzcxNSIsIm9wZW5TeXN0ZW0iOiIiLCJjaGFubmVsIjoidGlja2V0IiwibW9iaWxlIjoiMTMzOTc1MTgwMjYiLCJhQ2xpZW50SWQiOiI4NDdjZTc4NDc4YTIxMWU5OWM3ZTdjZDMwYWQzYTZhOCIsImF2YXRhciI6Imh0dHBzOi8vemhvbmd0YWlvc3MuYm5keHFjLmNvbS8xNjAyMTM3NTk5MzExLnBuZyIsInN5cyI6ImltMiIsInVzZXJOYW1lIjoi5p2O5oy6IiwidXNlcklkIjoiMDBwdGJuZDE0MDYyNTcxOTIxNTk5NDQ0MjAzNjM3MTUiLCJzdGFmZklkIjoiMDBwdGJuZDExMjUwMDI2NDYxNTk5NDQ0MjAzNzMwMTUifSwiY2xpZW50SWQiOiI4NDdjZTc4NDc4YTIxMWU5OWM3ZTdjZDMwYWQzYTZhOCIsImp0aSI6ImU2NmU0Y2YzNGEwZGE3NWEwZTcxZjVlMjhlYTQ3NDg3IiwidXNlcktleSI6Ijg0N2NlNzg0NzhhMjExZTk5YzdlN2NkMzBhZDNhNmE4IzEzMzk3NTE4MDI2I3RpY2tldCNpbTIjZTY2ZTRjZjM0YTBkYTc1YTBlNzFmNWUyOGVhNDc0ODcifQ.2Y88ZmGg97mfl0cf_IwPWHAy79A1ychG0x-dco_GCuE',
		// 	isChecked: 0,
		// 	phoneNumber: '',
		// 	isAutoLogin: 1,
		// 	startTime: 1603863639800,
		// 	endTime: 1605159639800
		// });
		// db.deleteTable('temp_table');
		// console.log(await db.getTableFieldName('user_info'))
		// let res = await db.select(`select * from user_info`);
		// console.log(res);

		// console.log(data);
		// let table = await db.getAllTable();
		// console.log(table);
		// db.createTable(`create table if not exists goods (
		// 	id integer primary key autoincrement,
		// 	goodsname varchar(12),
		// 	price init,
		// 	title varchar(30),
		// 	desc text
		// )`).then(res=>{
		// 	console.log(res);
		// });

		// db.getAllTable().then(tables => {
		// 	console.log(tables);
		// })


		// 先执行插入操作
		// let res = await db.insert('userTable', {
		// 	username: 'motou',
		// 	password: '1557465820',
		// 	info: '666 '
		// });
		// console.log(res);
		// 再查下数据库
		// let res = await db.select(`select * from userTable limit 10`);
		// console.log(JSON.stringify(res));
	})();
module.exports = db;