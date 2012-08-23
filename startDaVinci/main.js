
//--btnOk_onclick - start
function btnOk_onclick(e, obj, index) {
	var pageOption = {transition : "slide"}; 
	$.davinci.changePage("subPage", pageOption);
	
}
//--btnOk_onclick - end

	
//--subPage_onpageshow - start
function subPage_onpageshow(e, obj) {
	//get Textfield data
	var txtName = $.davinci.getInstance("txfName").text();
	var lblName = $.davinci.getInstance("lblName");
	//set label data
	lblName.text(txtName);
}
//--subPage_onpageshow - end

	
//--btnBack_onclick - start
function btnBack_onclick(e, obj, index) {
	var txtName = $.davinci.getInstance("txfName").text("");
	history.back();
}
//--btnBack_onclick - end

	