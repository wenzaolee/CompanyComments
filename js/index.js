"use strict";

var dappAddress = "n1kL8E7Apkk4CJpUgXskxakSEr8yeyCyL47"; //主网, hash: 59524d16983973b03c8e4d24993d6e717d18d6c470627157d812c3061beb043e
var nebulas = require("nebulas"),
Account = nebulas.Account,
neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

var NebPay = require("nebpay");    
var nebPay = new NebPay();

var pageSize = 10;
var totalCount = 0;
var totalPage = 0;
var pageIndex = 1;

var pageSize4Comment = 10;
var totalCount4Comment = 0;
var totalPage4Comment = 0;
var pageIndex4Comment = 1;
var myProvince = "";

var isMainPage = false;
var isViewCompany = false;

var intervalQuery;
var serialNumber;
var queryCount = 0;

function refreshPage(){
	if(isMainPage==true){
		showTable(pageIndex);
	}
	else if(isViewCompany==true){
		var name=$.trim($("#viewName").text());
		viewCompany(name);
	}
}

function showMainpage(){
	$("#main").show(); isMainPage = true;
	$("#addCompany").hide();
	$("#viewCompany").hide();  isViewCompany = false;
	$("#modifyCompany").hide();
    $("#loading").show();
    $("#searchName").val("")
    pageIndex = 1;
	showTable(pageIndex);
}





function changeProvince(){
	var newProvince= $.trim($("#myProvince").val());
	if(newProvince!=myProvince){
		myProvince = newProvince;
		pageSize = 10;
		totalCount = 0;
		totalPage = 0;
		pageIndex = 1;
		pageSize4Comment = 10;
		totalCount4Comment = 0;
		totalPage4Comment = 0;
		pageIndex4Comment = 1;
		$("#loading").hide();
		showMainpage();
 	}
}
	



function showTable(toPageIndex){
	 var from = Account.NewAccount().getAddressString();
     var value = "0";
     var nonce = "0"
     var gas_price = "1000000"
     var gas_limit = "2000000"
     var callFunction = "getCompanyListForGlobal";
     var callArgs = "[" +((toPageIndex-1)*pageSize + 1)+","+pageSize+ "]"; 
     
     if(myProvince!=""){
    	  callFunction = "getCompanyList";
          callArgs = "[\"" + myProvince + "\"," +((toPageIndex-1)*pageSize + 1)+","+pageSize+ "]"; 
     }
     
     var contract = {
         "function": callFunction,
         "args": callArgs
     }
     neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
    	 $("#loading").hide();
    	 var result = resp.result     
         console.log("return of getCommpanyList: " + JSON.stringify(result))
         if (result != 'null'){
        	 var arrayResult = JSON.parse(JSON.parse(result));
        	 pageIndex = toPageIndex;
        	 var str="";
        	 for(var i= 0;i< arrayResult.length ;i++){
        		 var item= arrayResult[i];
        		 totalCount = item.totalCompanyCount;
        		 str += "<tr>";
        		 str += "<td> <a href=\"javascript:goToViewCompany('" + item.name + "')\" >" + item.name + "</a></td>";
        		 str += "<td>" + item.province + "</td>";
        		 str += "<td>" + item.totalCommentCount + "</td>";
        		 str += "<td>" + Math.round(10*item.avgScore)/10 + "</td>";
        		 str += "</tr>"
        	 }
        	 totalPage = Math.ceil(totalCount/pageSize);
        	 $("#tbody").html(str); 
        	 $("#totalCount").text(""+totalCount);
        	 $("#totalPage").text(""+totalPage);
        	 $("#pageIndex").text(""+pageIndex);
         }
     }).catch(function (err) {
         console.log("error:" + err.message)
     })
}



function searchCompany(){
	var name=$.trim($("#searchName").val());
	if(name == ""){
		showTable(1) ;
		return;
	}
	isMainPage = false;
	isViewCompany = false;
	var from = Account.NewAccount().getAddressString();
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "searchCompany";
    var callArgs = "[\"" + myProvince +  "\",\"" +name+ "\"]"; 
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    $("#loading").show();
    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        $("#loading").hide();
     	 var result = resp.result     
          console.log("return of getCompany: " + JSON.stringify(result))
          if (result=='null'){
        	  $("#tbody").html(""); 
        	  alert("未找到记录!");
        	  totalCount = 0;
        	  pageIndex = 0;
        	  totalPage = 0;
          }
          else{
        	 var arrayResult = JSON.parse(JSON.parse(result));
         	 pageIndex = 1;
         	 var str="";
         	 for(var i= 0;i< arrayResult.length ;i++){
         		 var item= arrayResult[i];
         		 totalCount = item.totalCompanyCount;
         		 str += "<tr>";
         		 str += "<td> <a href=\"javascript:goToViewCompany('" + item.name + "')\" >" + item.name + "</a></td>";
         		 str += "<td>" + item.province + "</td>";
         		 str += "<td>" + item.totalCommentCount + "</td>";
         		 str += "<td>" + Math.round(10*item.avgScore)/10 + "</td>";
         		 str += "</tr>"
         	 }
         	 totalPage = Math.ceil(totalCount/pageSize);
         	 $("#tbody").html(str); 
         	 $("#totalCount").text(""+totalCount);
         	 $("#totalPage").text(""+totalPage);
         	 $("#pageIndex").text(""+pageIndex);
          }
     	 $("#totalCount").text(""+totalCount);
       	 $("#totalPage").text(""+totalPage);
       	 $("#pageIndex").text(""+pageIndex);
      });
}



function showTable4Comment(toPageIndex){
	var name=$.trim($("#viewName").text());
	var from = Account.NewAccount().getAddressString();
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getCommentList";
    var callArgs = "[\"" + name + "\"," +((toPageIndex-1)*pageSize4Comment + 1)+","+pageSize4Comment+ "]"; 
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
   	 var result = resp.result     
        console.log("return of getCommentList: " + JSON.stringify(result))
        if (result != 'null'){
       	 var arrayResult = JSON.parse(JSON.parse(result));
       	 pageIndex4Comment = toPageIndex;
       	 var str="";
       	 for(var i= 0;i< arrayResult.length ;i++){
       		 var item= arrayResult[i];
       		 str += "<tr>";
       		 str += "<td>作者: " + item.createdBy  ;
       		 str += "&nbsp;&nbsp;&nbsp;&nbsp;日期:" + item.createdDate  ;
       		 if(item.score>0){
       		    str += "&nbsp;&nbsp;&nbsp;&nbsp;评分:" + item.score   ;
       		 }
       		 str += "<br/>" + item.remark + "</td>";
       		 str += "</tr>"
       	 }
       	 $("#commentList").html(str);  
       	 $("#pageIndex4Comment").text(""+pageIndex4Comment);
        }
    }).catch(function (err) {
        console.log("error:" + err.message)
    })
}       	 




function goToViewCompany(name){
	$("#main").hide(); 
	isMainPage = false;
	$("#addCompany").hide();
	$("#viewCompany").show(); 
	isViewCompany = true;
	$("#modifyCompany").hide();
    $("#loading").show();
    $("#newRemark").val("");
	$("#newScore").val("0");
	$("#commentList").html(""); 
	$("#viewName").text("");
	$("#viewProvince").text("");
	$("#viewAddress").text("");
	$("#viewProperty").text("");
	$("#viewIndustry").text("");
	$("#viewScale").text("");
	$("#viewWebSite").text("");
	$("#viewIntroduction").text("");
	$("#viewCommentCount").text("");
	$("#viewAvgScore").text("");
	$("#newRemark").val("");
	$("#newScore").val("0");
	$("#totalCount4Comment").text("");
  	$("#totalPage4Comment").text("");
	viewCompany(name);
}



function toViewCompany(name){
	$("#main").hide(); 
	isMainPage = false;
	$("#addCompany").hide();
	$("#viewCompany").show(); 
	isViewCompany = true;
	$("#modifyCompany").hide();
    $("#loading").show();
	viewCompany(name);
}


function viewCompany(name){
	$("#viewName").text(name);
	var from = Account.NewAccount().getAddressString();
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getCompany";
    var callArgs = "[\"" +name+ "\"]"; 
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
         $("#loading").hide();
      	 var result = resp.result     
           console.log("return of getCompany: " + JSON.stringify(result))
           if (result=='null'){
        	   showMainpage();
           }
           else{
        	   result = JSON.parse(JSON.parse(result)); 
        		$("#viewName").text(name);
        		$("#viewProvince").text(result.province);
        		$("#viewAddress").text(result.address);
        		$("#viewProperty").text(result.property);
        		$("#viewIndustry").text(result.industry);
        		$("#viewScale").text(result.scale);
        		$("#viewWebSite").text(result.webSite);
        		$("#viewIntroduction").text(result.introduction);
        		$("#viewCommentCount").text(result.totalCommentCount);
        		$("#viewAvgScore").text( Math.round(10*result.avgScore)/10);
          		totalCount4Comment = result.totalCommentCount;
                totalPage4Comment = Math.ceil(totalCount4Comment/pageSize4Comment);
          		$("#totalCount4Comment").text(""+totalCount4Comment);
              	$("#totalPage4Comment").text(""+totalPage4Comment);
        		showTable4Comment(1)
           }
       });
}



function toModifyCompany(name){
	$("#modifyName").text("");
	$("#modifyProvince").val("");
	$("#modifyAddress").val("");
	$("#modifyProperty").val("北京");
	$("#modifyIndustry").val("");
	$("#modifyScale").val("");
	$("#modifyWebSite").val("");
	$("#modifyIntroduction").val("");
	var from = Account.NewAccount().getAddressString();
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getCompany";
    var callArgs = "[\"" +name+ "\"]"; 
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
    	  var result = resp.result     
         console.log("return of getCompany: " + JSON.stringify(result))
         if (result=='null'){
         	  alert("公司不存在!")
         }
         else{
      	   result = JSON.parse(JSON.parse(result));
      		$("#main").hide(); isMainPage = false;
      		$("#addCompany").hide();
      		$("#viewCompany").hide(); isViewCompany = false;
      		$("#modifyCompany").show();
      		$("#modifyName").text(name);
      		$("#modifyProvince").val(result.province);
      		$("#modifyAddress").val(result.address);
      		$("#modifyProperty").val(result.property);
      		$("#modifyIndustry").val(result.industry);
      		$("#modifyScale").val(result.scale);
      		$("#modifyWebSite").val(result.webSite);
      		$("#modifyIntroduction").val(result.introduction);
         }
     });
}


function toAddNewCompany(){	
	$("#main").hide(); isMainPage = false;
	$("#addCompany").show();
	$("#viewCompany").hide(); isViewCompany = false;
	$("#modifyCompany").hide();
	$("#newName").val("");
	$("#newAddress").val("");
	$("#newWebSite").val("");
	$("#newIntroduction").val("");
}

function toRefreshCompany4View(){
	var name=$.trim($("#viewName").text());
	toViewCompany( name);
}

function toVoteCompany4View(){
	var name=$.trim($("#viewName").text());
	voteCompany( name);
}

function toModifyCompany4View(){
	var name=$.trim($("#viewName").text());
	toModifyCompany( name);
}

function toViewCompany4Modify(){
	var name=$.trim($("#modifyName").text());
	toViewCompany( name);
}


function addNewCompany(){
	var name=$.trim($("#newName").val());
	var province=$.trim($("#newProvince").val());
	var address=$.trim($("#newAddress").val());
	var property=$.trim($("#newProperty").val());
	var industry=$.trim($("#newIndustry").val());
	var scale=$.trim($("#newScale").val());
	var webSite=$.trim($("#newWebSite").val());
	var introduction=$.trim($("#newIntroduction").val());

	if(""==name){
		alert("公司名称不能为空!");
		return;
	} 
	if (name.length > 64) {
		alert("公司名长度不能超过64字!");
		return;	
	} 
	if(introduction.length>150){
		alert("简介长度不能超过150字!");
		return;
	}
    var from = Account.NewAccount().getAddressString();
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getCompany";
    var callArgs = "[\"" +name+ "\"]"; 
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
      	 var result = resp.result     
           console.log("return of getCompany: " + JSON.stringify(result))
           if (result!='null'){
           	alert("公司已经存在!")
           }
           else{
           	value = "0";
           	callFunction = "addCompany"
           	callArgs = "["+"\""+name+"\","+"\""+province+"\","+"\""+address+"\","+"\""+property+"\","+"\""+industry+"\","+"\""+scale+"\","+"\""+webSite+"\","+"\""+introduction+"\""+ "]"; 
           	serialNumber = nebPay.call(dappAddress, value, callFunction, callArgs, {    
                   listener: cb4NebPayCall, 
                   callback: NebPay.config.mainnetUrl
               });
               if(intervalQuery!=null){
                   clearInterval(intervalQuery);  
               }
               intervalQuery = setInterval(function () {
                   funcIntervalQuery(null);
               }, 11000);
               queryCount = 0;
               $("#loading").show();
           }
       });
   }


function addComment(){
	var name=$.trim($("#viewName").text());
	var remark=$.trim($("#newRemark").val());
	var score=$.trim($("#newScore").val()); 
	if(""==name){
		alert("公司名称不能为空!");
		return;
	} 
	if (name.length > 64) {
		alert("公司名长度不能超过64个字!");
		return;	
	} 
	if(remark.length<5){
		alert("评价长度不能少于5个字!");
		return;
	}
	if(remark.length>150){
		alert("评价长度不能超过150个字!");
		return;
	}
    var from = Account.NewAccount().getAddressString();
    var value = "0";
    var nonce = "0"
    var callFunction = "addComment";
    var callArgs = "[\"" +name+ "\","+ score + ",\""+ remark+ "\"]"; 
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    serialNumber = nebPay.call(dappAddress, value, callFunction, callArgs, {    
        listener: cb4NebPayCall, 
        callback: NebPay.config.mainnetUrl
    });
    if(intervalQuery!=null){
        clearInterval(intervalQuery);  
    }
    intervalQuery = setInterval(function () {
        funcIntervalQuery(name);
    }, 11000);
    queryCount = 0;
    $("#loading").show();
    //$("#newRemark").val("");
	//$("#newScore").val("0");
}


function modifyCompany(){
	var name=$.trim($("#modifyName").text());
	var province=$.trim($("#modifyProvince").val());
	var address=$.trim($("#modifyAddress").val());
	var property=$.trim($("#modifyProperty").val());
	var industry=$.trim($("#modifyIndustry").val());
	var scale=$.trim($("#modifyScale").val());
	var webSite=$.trim($("#modifyWebSite").val());
	var introduction=$.trim($("#modifyIntroduction").val());

	if(""==name){
		alert("公司名不能为空!");
		return;
	}
	if(introduction.length>150){
		alert("简介长度不能超过150字!");
		return;
	}
    var from = Account.NewAccount().getAddressString();
    var value = "0";
	var callFunction = "modifyCompany"
    var	callArgs = "["+"\""+name+"\","+"\""+province+"\","+"\""+address+"\","+"\""+property+"\","+"\""+industry+"\","+"\""+scale+"\","+"\""+webSite+"\","+"\""+introduction+"\""+ "]"; 
    	serialNumber = nebPay.call(dappAddress, value, callFunction, callArgs, {    
            listener: cb4NebPayCall, 
            callback: NebPay.config.mainnetUrl
        });
        if(intervalQuery!=null){
            clearInterval(intervalQuery);  
        }
        intervalQuery = setInterval(function () {
            funcIntervalQuery(name);
        }, 11000);
        queryCount = 0;
        $("#loading").show();
}

function cb4NebPayCall(resp) {
    console.log("response of nebPay.call: " + JSON.stringify(resp))
}


function funcIntervalQuery(CompanyName) {
    nebPay.queryPayInfo(serialNumber)   //search transaction result from server (result upload to server by app)
        .then(function (resp) {
            console.log("tx result: " + resp)   //resp is a JSON string
            var respObject = JSON.parse(resp)
            if(respObject.code === 0){  
                $("#loading").hide();
                alert("操作成功! 若页面未更新, 请稍后点击刷新按钮.");
                if(CompanyName==null){
                    showMainpage();
                }
                else{
                	toViewCompany(CompanyName);
                	$("#newRemark").val("");
            		$("#newScore").val("0");
                }
                clearInterval(intervalQuery);  
            } 
            queryCount++;
            if(queryCount>20){
            	$("#loading").hide();
            	clearInterval(intervalQuery);  
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}

function lastPage(){
	if(pageIndex<=1){
		return;
	} 
	showTable(pageIndex-1);
}

function nextPage(){
	if(pageIndex>=totalPage){
		return;
	}
	showTable(pageIndex+1);
}

function lastPage4Comment(){
	if(pageIndex4Comment<=1){
		return;
	} 
	showTable4Comment( pageIndex4Comment-1);
}

function nextPage4Comment(){
	if(pageIndex4Comment>=totalPage4Comment){
		return;
	}
	showTable4Comment( pageIndex4Comment+1);
}

function refreshTable(){
	searchCompany();
}


    
    
    
    
    


       	 
       	 
     	 
