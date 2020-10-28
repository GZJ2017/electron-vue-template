// const express = require('express');
// const app = express();

const initSqlJs  = require('sql.js');
const fs = require('fs');



class Db {
	constructor(options){
		this.options = options;

		this.db = this.init();
	}
	async init(){
		// 读取本地数据库文件
		const dataDbFile = fs.readFileSync(this.options.database);
		// 初始化数据库
		const SQL = await initSqlJs({});
		// 创建数据库实例
		let db = new SQL.Database(dataDbFile);
		return db;
	}
	// 执行sql语言
	async query(sql, data = []){
		const db = await this.db;
		let res = null;
		try {
			res = db.run(sql, data);
			fs.writeFile(this.options.database, db.export(), err => {
				if(err) throw err;
			});
		} catch(e){
			console.log('数据库语句出错：', e);
		}
		return res;
	}
	// 查询数据
	async select(sql){
		const db = await this.db;
		let res = db.exec(sql);
		return res;
	}
	// 插入数据
	async insert(sql, data = []){
		return this.query(sql, data);
	}
	// 删除数据
	async delete(sql, data = []){
		return this.query(sql, data);
	}
	// 跟新数据
	async update(sql, data = []){
		return this.query(sql, data);
	}
	// 创建表
	async createTable(sql){
		return this.query(sql);
	}
	async selectTable(sql){
		
	}
}

let db = new Db({
	database: './data/db.sqlite'
});

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
	// db.selectTable(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).then(res=>{
	// 	console.log(res);
	// })
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