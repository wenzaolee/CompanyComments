"use strict";

Date.prototype.format = function(fmt) { 
    var o = { 
       "M+" : this.getMonth()+1, 
       "d+" : this.getDate(),    
       "h+" : this.getHours(),    
       "m+" : this.getMinutes(),        
       "s+" : this.getSeconds(),      
       "S"  : this.getMilliseconds()   
   }; 
   if(/(y+)/.test(fmt)) {
           fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
   }
    for(var k in o) {
       if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
   return fmt; 
}

var Company = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.id = obj.id;
		this.name = obj.name;
		this.province = obj.province;
		this.city = obj.city;
		this.address = obj.address;
		this.property = obj.property;
		this.industry = obj.industry;
		this.scale = obj.scale;
		this.webSite = obj.webSite;
		this.introduction = obj.introduction;
		this.avgScore = obj.avgScore;
		this.totalScore = obj.totalScore;
		this.totalScoreCount = obj.totalScoreCount;
		this.totalCommentCount = obj.totalCommentCount;
		this.createdDate = obj.createdDate;
		this.createdBy = obj.createdBy;
		this.lastModifiedDate = obj.lastModifiedDate;
	} else {
		this.id = 0;
		this.name = "";
		this.province = "";
		this.city = "";
		this.address = "";
		this.property = "";
		this.industry = "";
		this.scale = "";
		this.webSite = "";
		this.introduction = "";
		this.avgScore = 0;
		this.totalScore = 0;
		this.totalScoreCount = 0;
		this.totalCommentCount = 0;
		this.createdDate = new Date().format("yyyy-MM-dd hh:mm:ss");
		this.createdBy = "";
		this.lastModifiedDate = new Date().format("yyyy-MM-dd hh:mm:ss");
	}
};

Company.prototype = {
	toString : function() {
		return JSON.stringify(this);
	}
};

var Comment = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.id = obj.id;
		this.remark = obj.remark;
		this.score = obj.score;
		this.createdDate = obj.createdDate;
		this.createdBy = obj.createdBy;
	} else {
		this.id = "";
		this.remark = "";
		this.score = 0;
		this.createdDate = new Date().format("yyyy-MM-dd hh:mm:ss");
		this.createdBy = "";
	}
};

Comment.prototype = {
	toString : function() {
		return JSON.stringify(this);
	}
};

var CompanyComments = function() {
	LocalContractStorage.defineMapProperty(this, "companyDetailMap");
	LocalContractStorage.defineMapProperty(this, "id2CompanyNameMap");
	LocalContractStorage.defineMapProperty(this, "id2CommentMap");
	LocalContractStorage.defineMapProperty(this, "province2CompanyNameMap");
	LocalContractStorage.defineProperty(this, "totalCompanyCount");
};

CompanyComments.prototype = {
	init : function() {
		this.totalCompanyCount = 0;
		this.totalCommentCount = 0;
	},

	addCompany : function(name, province, address, property, industry, scale,
			webSite, introduction) {
		name = name.trim();
		if (name == "") {
			throw new Error("公司名不能为空");
		}
		if (name.length > 64) {
			throw new Error("公司长度不能超过64个字符")
		}
		province = province.trim();
		if (province == "") {
			throw new Error("省份不能为空");
		}
		var from = Blockchain.transaction.from;
		var company = this.companyDetailMap.get(name);
		if (company) {
			throw new Error("公司名已经存在");
		}
		this.totalCompanyCount++;
		company = new Company();
		company.id = this.totalCompanyCount;
		company.name = name;
		company.province = province;
		company.address = address;
		company.property = property;
		company.industry = industry;
		company.scale = scale;
		company.webSite = webSite;
		company.introduction = introduction;
		company.avgScore = 0;
		company.totalScore = 0;
		company.totalScoreCount = 0;
		company.totalCommentCount = 0;
		company.createdDate = new Date().format("yyyy-MM-dd hh:mm:ss");
		company.createdBy = from;
		company.lastModifiedDate = new Date().format("yyyy-MM-dd hh:mm:ss");
		this.companyDetailMap.put(name, company);

		this.id2CompanyNameMap.put(company.id, name);

		var companyNameArray = this.province2CompanyNameMap.get(province);
		if (companyNameArray == null) {
			companyNameArray = new Array();
		}
		companyNameArray.push(name);
		this.province2CompanyNameMap.put(province, companyNameArray);
	},

	modifyCompany : function(name, province, address, property, industry, scale,
			webSite, introduction) {
		name = name.trim();
		province = province.trim();
		if (province == "") {
			throw new Error("省份不能为空");
		}
		var company = this.companyDetailMap.get(name);
		if (company == null) {
			throw new Error("公司名不存在");
		}
		var oldProvince = company.province;
		company.province = province;
		company.address = address;
		company.property = property;
		company.industry = industry;
		company.scale = scale;
		company.webSite = webSite;
		company.introduction = introduction;
		company.lastModifiedDate = new Date().format("yyyy-MM-dd hh:mm:ss");
		this.companyDetailMap.put(name, company);

		if (oldProvince != province) {
			var oldCompanyNameArray = this.province2CompanyNameMap.get(oldProvince);
			if (oldCompanyNameArray != null) {
				for (var i = 0; i < oldCompanyNameArray.length; i++) {
					if (oldCompanyNameArray[i] == name) {
						oldCompanyNameArray.splice(i, 1);
						break;
					}
				}
				this.province2CompanyNameMap.put(oldProvince, oldCompanyNameArray);
			}

			var newCompanyNameArray = this.province2CompanyNameMap.get(province);
			if (newCompanyNameArray == null) {
				newCompanyNameArray = new Array();
			}
			newCompanyNameArray.push(name);
			this.province2CompanyNameMap.put(province, newCompanyNameArray);
		}

	},

	getCompany : function(name) {
		name = name.trim();
		if (name == "") {
			throw new Error("公司名不能为空");
		}
		var company = this.companyDetailMap.get(name);
		if (company) {
			return JSON.stringify(company);
		}
		return null;
	},

	addComment : function(name, score, remark) {
		name = name.trim();
		if (name == "") {
			throw new Error("公司名不能为空");
		}
		if (score > 5) {
			throw new Error("score 不能大于5 ");
		}
		var company = this.companyDetailMap.get(name);
		if (company) {
			var from = Blockchain.transaction.from;
			if (score > 0) {
				company.totalScore += score;
				company.totalScoreCount++;
				company.avgScore = company.totalScore / company.totalScoreCount;
			}
			company.totalCommentCount++;
			company.lastModifiedDate = new Date().format("yyyy-MM-dd hh:mm:ss");
			this.companyDetailMap.put(name, company);

			var comment = new Comment();
			comment.id = company.id + "_" + company.totalCommentCount;
			comment.remark = remark;
			comment.score = score;
			comment.createdDate = new Date().format("yyyy-MM-dd hh:mm:ss");
			comment.createdBy = from;
			this.id2CommentMap.put(comment.id, comment);
		} else {
			throw new Error("公司名不存在");
		}
	},

	getCompanyListForGlobal : function(startIndex, pageSize) {
		if (isNaN(startIndex)) {
			throw new Error("startIndex 必须为数字");
		}
		if (isNaN(pageSize)) {
			throw new Error("pageSize 必须为数字");
		}
		if (startIndex <= 0) {
			throw new Error("startIndex 必须大于0 ");
		}
		if (pageSize <= 0) {
			throw new Error("pageSize 必须大于0 ");
		}
		var resultArray = new Array();
		var endIndex = Math.min(startIndex + pageSize - 1,
				this.totalCompanyCount);
		for (var i = startIndex; i <= endIndex; i++) {
			var name = this.id2CompanyNameMap.get(i);
			if (name) {
				var company = this.companyDetailMap.get(name);
				company.totalCompanyCount = this.totalCompanyCount;
				resultArray.push(company);
			}
		}
		return JSON.stringify(resultArray);
	},

	getCompanyList : function(province, startIndex, pageSize) {
		if (isNaN(startIndex)) {
			throw new Error("startIndex 必须为数字");
		}
		if (isNaN(pageSize)) {
			throw new Error("pageSize 必须为数字");
		}
		if (startIndex <= 0) {
			throw new Error("startIndex 必须大于0 ");
		}
		if (pageSize <= 0) {
			throw new Error("pageSize 必须大于0 ");
		}
		var resultArray = new Array();
		var companyNames = this.province2CompanyNameMap.get(province);
		if (companyNames) {
			var endIndex = Math.min(startIndex + pageSize - 2,
					companyNames.length-1);
			for (var i = startIndex-1; i <= endIndex; i++) {
				var name = companyNames[i];
				if (name) {
					var company = this.companyDetailMap.get(name);
					company.totalCompanyCount = companyNames.length;
					resultArray.push(company);
				}
			}
		}
		return JSON.stringify(resultArray);
	},

	getCommentList : function(name, startIndex, pageSize) {
		if (isNaN(startIndex)) {
			throw new Error("startIndex 必须为数字");
		}
		if (isNaN(pageSize)) {
			throw new Error("pageSize 必须为数字");
		}
		if (startIndex <= 0) {
			throw new Error("startIndex 必须大于0 ");
		}
		if (pageSize <= 0) {
			throw new Error("pageSize 必须大于0 ");
		}
		name = name.trim();
		if (name == "") {
			throw new Error("公司名不能为空");
		}
		var company = this.companyDetailMap.get(name);
		var resultArray = new Array();
		var reverseStart = company.totalCommentCount - startIndex + 1;
		var reverseEnd = Math.max(1, company.totalCommentCount - startIndex - pageSize + 1);
         //reverse order
		for (var i = reverseStart; i >= reverseEnd; i--) {
			var id = company.id + "_" + i;
			var comment = this.id2CommentMap.get(id);
			if (comment) {
				resultArray.push(comment);
			}
		}
		return JSON.stringify(resultArray);
	}

};
module.exports = CompanyComments;