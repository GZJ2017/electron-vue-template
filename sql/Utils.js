
module.exports =  class Format {
	// 判断一个变量类型是否为对象
	isObject(obj){
		return Object.prototype.toString.call(obj) === "[object Object]";
	}
	// 判断一个变量类型是否是数组
	isArray(arr){
		return Array.isArray(arr);
	}
	// 判断一个变量类型是否是字符串
	isString(str){
		return Object.prototype.toString.call(str) === "[object String]";
	}
	/**
	 * 格式化查询数据，将查询出来的数据进行格式化为json对象
	 * @param  { Object } data 查询所得结果
	 * @return { Array }      返回查询格式化之后的数据
	 */
	formatSelectData({values, columns}){
		if(!values || !columns) return [];
		return values.map( 
			res => res.reduce(
				(a, b, index) => Object.assign(a, {[columns[index]]:b}), {}
			)
		)
	}
	/**
	 * 格式化插入数据
	 * @param  {Object} data 	需要格式化的对象
	 * @return {Object}      	返回格式化之后的对象
	 */
	formatData(data){
		return Object.entries(data).reduce((a,b,i) => ({
			key: a.key + (i ? ',' : '') + b[0],
			val: a.val + (i ? ',' : '') + (this.isString(b[1]) ? `'${b[1]}'`: b[1])
		}), {key: '', val: ''});
	}
	/**
	 * 格式化条件数据
	 * @return {[type]} [description]
	 */
	formatWhereData(whe, spt = ' AND '){
		return Object.entries(whe).map(ele => (
			ele[0]+'='+ (this.isString(ele[1])? `'${ele[1]}'`: ele[1]))
		).join(spt);
	}
	/**
	 * 格式化创建表格数据
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	formatCreateTableData(data){
		let content = '';
		for(var key in data) {
			content += `,${key} `;
			if(Array.isArray(data[key])){
				content += data[key].join(' ');
			} else if(typeof data[key] === 'string') {
				content += data[key];
			} else {
				console.error("表的字段约束必须为字符串或者是数组");
			}
		}
		return content.slice(1);
	}
	/**
	 * 比较两个数组的差异
	 * @param  {Array} oldField 	旧数组
	 * @param  {Array} newField 	新数组
	 * @return {Object}          	{ newField 表示相对旧数组新增的元素, oldField 表示相对新数组多出的元素 }
	 */
	diff(oldField, newField) {
		newField.forEach((item, index)=>{
			let idx = oldField.indexOf(item);
			if(idx >= 0){
				newField[index] = '';
				oldField[idx] = '';
			}
		});
		newField = newField.filter(item => item)
		oldField = oldField.filter(item => item)
		return { newField, oldField }
	}
}