import Utils from './Utils';
import store from '../store'
const key = process.platform === "darwin" ? "CommandOrControl" : "alt";
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
    // 创建用户信息表
	createUserInfoTable(){
		return this.createTableSql('user_info', {
			username: 'varchar(20)',	// 用户名		
			uppassword: 'varchar(40)',	// 密码			
			token: 'text',				// 用户token	
			isChecked: 'integer',		// ?
			phoneNumber: 'varchar(11)',	// 用户手机号	   
			isAutoLogin: 'integer',		// 是否自动登录	    
			startTime: 'timestamp',		// 自动登录开始时间 
			endTime: 'timestamp',		// 自动登录过期时间 
		}, {
			username: '',
			uppassword: '',
			token: '',
			isChecked: 0,
			phoneNumber: '',
			isAutoLogin: 0,
			startTime: 0,
			endTime: 0
		});
    }
    // 创建文件表
	createFileTable(){
		return this.createTableSql('file', {
			mid: 'varchar(100)',
			uuid: 'varchar(100)',
			filePath: 'text',
			fileName: 'varchar(255)',
			state: 'varchar(20)',
			imgType: 'varchar(100)',
			createTime: 'timestamp',
			compeleteTime: 'timestamp'
		});
    }
    // 创建通用信息表
	createGeneralTable(){
		return this.createTableSql('general', {
			isCutShow: 'integer',			// 截图是否隐藏窗口
			winWidth: 'integer', 			// 窗口宽度
			winHeight: 'integer', 			// 窗口高度
			versionsContrast: 'integer',	// 版本对比
			moreVideoGuide: 'integer'		// 暂未测试
		}, {
			isCutShow: 0,
			winWidth: store.minWidth ? store.minWidth : 0,
			winHeight: store.minHeight ? store.minHeight: 0,
			versionsContrast: 0,
			moreVideoGuide: 1
		})
	}
	//创建系统设置表
	createSystemTable(){
		return this.createTableSql('system', {
			notifyMusic: 'integer',			// 消息提示音
			desktopNotify: 'integer', 			//  消息桌面通知
			desktopNotifyDetail: 'integer', 			//  消息桌面通知显示详情
			desktopVideo: 'integer',	// 语音和视频通话邀请桌面通知
			screenshotKey: 'varchar(20)',		// 截图快捷键
			openWinKey: 'varchar(20)',		// 打开窗口
			aliveSearchKey: 'varchar(20)',		// 激活搜索
			filePath: 'varchar(255)',    //文件存储路径
			fileDataSize: 'timestamp',   //文件大小
		}, {
			notifyMusic: 0,
			desktopNotify: 1,
			desktopNotifyDetail:1,
			desktopVideo:1,
			screenshotKey:`${key}+e`,
			openWinKey:`${key}+r`,
			aliveSearchKey: `${key}+w`,
			filePath:'',
			fileDataSize: ''
		})
	}
}
export default Table;