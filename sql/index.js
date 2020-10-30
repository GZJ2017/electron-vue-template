const initSqlJs  = require('sql.js');
const fs = require('fs');
const path = require('path');
const Format = require('./Format.js');


class Db extends Format {
	constructor(options){
		super(options);
		this.options = options;
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
		let res = null;
		res = db.run(sql, data);
		fs.writeFileSync(this.options.database, db.export());
		db.close();
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
	 * @param  {[type]} data      	表名的字段及字段约束
	 * @return {[type]}           [description]
	 */
	async createTable(tableName, data){
		const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${this.formatCreateTableData(data)})`
		return this.query(CREATE_TABLE_SQL);
	}
	/**
	 * 获取数据库中所有的表名
	 * @return {Array} 所有表名组成的数组
	 */
	async getAllTable(){
		let res = await this.select(`SELECT name FROM sqlite_master WHERE type='table'`);
		return res.values().next().value.values.map(arr => arr[0])
	}
}

let db = new Db({
	database: path.join(__dirname, './data/data.sqlite')
});
	// 如果需要保证执行顺序
	(async () => {
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
		let res = await db.pagingSelect("message_list", 2, 10);
		// console.log(res);

		console.log(res);
		// let res2 = await db.select(`select * from userTable limit 10`);
		// console.log(res2.values().next().value);
		// console.log(res);
		// await db.createTable('message_list', {
		// 	id: ['integer', 'primary key', 'autoincrement'],
		// 	msg: 'text',
		// 	user_id: 'varchar(60)',
		// 	username: 'varchar(12)',
		// 	time: 'datetime default current_timestamp'
		// });
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
	// db.insert(`insert into userTable (username, password, info) values(?,?,?)`, ["王五", "142536987", '133']).then(res=>{
	// 	console.log(res);
	// })

	// db.delete(`delete from userTable where id=3`).then(res=>{
	// 	console.log(res);
	// })

	// db.update(`update userTable set username='motou' where id=2`).then(res=>{
	// 	if(res){
	// 		console.log("跟新数据成功");
	// 	}
	// })
	// 创建table 如果表以存在则不创建
	// db.createTable(`create table if not exists goods (
	// 	id integer primary key autoincrement,
	// 	goodsname varchar(12),
	// 	price init,
	// 	title varchar(30),
	// 	desc text
	// )`).then(res=>{
	// 	console.log(res);
	// });
	
	// db.select(`select * from userTable`).then(res=>{
	// 	console.log(JSON.stringify(res));
	// })

// app.use('/', async (req,res)=>{

// 	res.send(data);
// })
// initSqlJs().then(SQL => {
// 	const db = new SQL.Database(dataDbFile);
// 	db.run(`insert into userTable (username, password, info) values(?,?,?)`, ["李四", "987654321"])
// 	let res = db.exec(`select * from userTable`);
// 	console.log(res);
// 	db.close();
	// const db = new SQL.Database();
	// const CREATE_TABLE_SQL = `create table userTable (
	// 	id integer primary key autoincrement,
	// 	username varchar(12),
	// 	password varchar(16),
	// 	info text
	// )`;
	// db.run(CREATE_TABLE_SQL);
	// db.run(`insert into userTable (username, password, info) values('张三', '123456', '测试')`)
				
	// let res = db.exec(`select * from userTable`);
	// var binaryArray = db.export();;
	// console.log(binaryArray);
	// fs.writeFile('./data/db.db3', binaryArray, (err)=>{
	// 	if(err) throw err;
	// 	console.log("文件保存成功");
	// })
// })










// const server = app.listen(3000, ()=>{
// 	console.log('服务器启动成功');
// })