import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import Table from './Table';

class Db extends Table {
	constructor(options = {}){
		super(options);
		this.options = Object.assign({
			database: this.getDatabaseUrl().dbpath
		}, options);
		this.dataDbFile = null;
		// 存储数据库表名 和 对应创建表的数据库语句
		this.tableNames = [
			this.createUserInfoTable(),
			this.createFileTable(),
			this.createGeneralTable(),
			this.createSystemTable()
		];
		this.db = null;
		this.timer = null;
		this.once = false;
	}
	initDatabase(){
		return new Promise((resolve) => {
			// 判断文件夹是否存在
			fs.stat(path.dirname(this.options.database), err => {
				// 文件夹不存在
				if(err) {
					fs.mkdirSync(path.dirname(this.options.database),{recursive: true})
				}
				// 存在则判断该文件是否存在
				fs.stat(this.options.database, async err => {
					if(err && err.code == 'ENOENT') {
						// 如果本地不存在该数据库则初始化
						const SQL = await initSqlJs();
						this.db = new SQL.Database();
						this.tableNames.forEach(item => this.db.run(item.sql));
						// 数据库备份
						this.backupDataBase(this.db);
						// 将数据库写入本地文件
						this.throttlingFun(()=>resolve({msg:'创建数据成功'}));
					} else {
						// 如果存在该数据库则进行数据库同步
						try {
							this.db = await this.openDatabase();
							let tables = this.db.exec(`SELECT name FROM sqlite_master WHERE type='table'`);
							tables = this.formatSelectData(tables.values().next().value);
							for(let table of this.tableNames){
								if(!tables.some(t=>t.name === table.name)){
									this.db.run(table.sql);
								}else {
									let field = this.db.exec(`PRAGMA table_info("${table.name}")`);
									field = this.formatSelectData(field.values().next().value).map(t=>t.name);
									let { newField, oldField } = this.diff(field, [...table.field]);
									if(newField.length) {
										// 执行表的字段增加 
										this.db.run(`ALTER TABLE ${table.name} ADD ${this.formatCreateTableData(newField.reduce((a,b)=>({
											[b]: table.data[b]
										}), {}))}`);
									}
									if(oldField.length){
										// 执行表的字段删除
										this.deleteField(table.name);
									}
								}
							}
							// 删除多余的表格
							let { oldField } = this.diff(tables.map(t=>t.name), this.tableNames.map(t => t.name));
							oldField.forEach(t=>this.db.run(`DROP TABLE ${t}`));
							// 备份数据库
							this.backupDataBase(this.db);
							this.throttlingFun();
							resolve({msg:'同步数据库成功'});
						}catch(err){
							this.errorHandler(err);
						}
					}
				})
			})
		});
	}
	async openDatabase(){
		// 读取本地数据库文件
		this.dataDbFile = fs.readFileSync(this.options.database);
		// 初始化数据库
		const SQL = await initSqlJs({});
		// 创建数据库实例
		if(!this.db){
			this.db = new SQL.Database(this.dataDbFile)
		}
		return this.db;
	}
	// 执行sql语言
	async query(sql, data = []){
		try{
			this.db = await this.openDatabase();
			this.db.run(sql, data);
			this.throttlingFun();
			return this.db;
		} catch(err){
			this.errorHandler(err);
		}
	}
	// 查询数据
	async select(sql){
		try{
			this.db = await this.openDatabase();
			let res = this.db.exec(sql);
			this.throttlingFun();
			if(res.values().next().value){
				return this.formatSelectData(res.values().next().value);
			} else {
				// 如果没有查询到数据则返回空数组
				return [];
			}
		}catch(err){
			this.errorHandler(err);
			return [{}];
		}
	}
	/**
	 * 保证函数顺序执行
	 * @param {Function} fn 需要调用的函数
	 * @param {Array} arg 调用函数的参数
	 */
	async sequential(fn, arg){
		return await this[fn](...arg);
	}
	/**
	 * 如果数据库表中存在改数据则跟新该数据，不存在则插入一条新数据
	 * @param {String} table 表名
	 * @param {Object} data 需要修改或者插入的数据
	 * @param {Object} whe 判断数据是否存在的条件
	 */
	async mergeData(table, data = {}, whe = {}){
		this.db = await this.openDatabase();
		whe = this.formatWhereData(whe);
		const SELECT_SQL = `SELECT * FROM ${table} ${whe? 'WHERE ' + whe: ''}`;
		let res = this.db.exec(SELECT_SQL);
		if(res.values().next().value){
			let val = this.formatSelectData(res.values().next().value)[0];
			this.db.run(`UPDATE ${table} SET ${this.formatWhereData({...val,...data}, ', ')} ${whe ? 'where '+ whe: ''};`)
		} else {
			data = this.formatData(data);
			this.db.run(`INSERT INTO ${table} (${data.key}) values(${data.val})`)
		}
		this.throttlingFun();
		return this.db;
	}
	/**
	 * 性能优化节流函数，延迟关闭数据库防止短时间内多次触发数据库文件读写事件
	 * @param  {Function} cb 回调函数
	 */
	throttlingFun(cb){
		clearTimeout(this.timer);
		this.timer = setTimeout(()=>{
			fs.writeFileSync(this.options.database, this.db.export());
			this.db.close();
			this.db = null;
			this.dataDbFile = null;
			this.once = false;
			if(cb) cb();
		},100)
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
	 * @param  {Object} data  	需要跟新的字段
	 * @param  {Object} whe   	跟新的条件(只支持相等的条件，其他条件不支持)
	 * @return {[type]}       [description]
	 */
	async update(table, data = {}, whe){
		let UPDATE_SQL = `UPDATE ${table} SET ${this.formatWhereData(data, ', ')} ${whe ? 'where '+ this.formatWhereData(whe): ''};`
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
		this.db = await this.openDatabase();
		let newTable = this.tableNames.filter(t=>t.name === table)[0];
		this.db.run(`ALTER TABLE ${table} RENAME TO temp_table;`);
		this.db.run(`CREATE TABLE ${table} (${this.formatCreateTableData(newTable.data)});`)
		this.db.run(`INSERT INTO ${table} (${newTable.field.join()}) SELECT ${newTable.field.join()} FROM temp_table;`);
		this.db.run(`DROP TABLE temp_table;`);
		this.throttlingFun();
		return this.db;
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
}

let db = new Db();
export default db;