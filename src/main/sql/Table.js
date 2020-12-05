import Utils from './Utils';
import store from '../store'
class Table extends Utils{
	/**
	 * 初始化数据库表
	 * @param  {String} tableName 表名
	 * @param  {Object} data      表字段约束
	 * @param  {Object} initData  表第一条初始数据
	 * @return {[type]}           [description]
	 */
	createTableSql(tableName, data, initData) {
		let insert = '';
		if(initData){
			initData = this.formatData(initData);
			insert = `INSERT INTO ${tableName} (${initData.key}) values(${initData.val})`;
		}
		return {
			name: tableName,
			sql: `CREATE TABLE ${tableName} (${this.formatCreateTableData(data)}); ${insert}`,
			field: Object.keys(data),
			data
		}
	}
}
export default Table;