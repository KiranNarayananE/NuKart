

$(document).ready(function() {
axios.get('/admin/salesProject', {
	params: {
	  from: "2020-01-11",
	  to:moment(new Date()).format('YYYY-MM-DD'),
	  filter: "%U-%Y"
	}
  }).then((e) => {
	let {saleReport}=e.data
	let weeklySales = [];
    let weeklyProfit = [];
    let datedata = [];

    for (let i = 0; i < saleReport.length; i++) {
        weeklySales.push(saleReport[i].totalPrice);
        weeklyProfit.push((saleReport[i].totalPrice * 10) / 100);
        datedata.push(saleReport[i]._id);
    }
	
	

    
		"use strict";
		
		// apexchart1
		var options = {
			chart: {
				height: 350,
				type: 'area',
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'smooth'
			},
			series: [{
				name: 'weekly sales',
				data: weeklySales
			}, {
				name: 'weekly profit',
				data: weeklyProfit
			}],
			xaxis: {
				type: 'string',
				categories: datedata,
			},
			
		}
		var chart = new ApexCharts(document.querySelector("#apexchart1"), options);
		chart.render();



    
		

    
	


});

axios.get('/admin/salesProject', {
	params: {
	  from: "2020-01-11",
	  to:moment(new Date()).format('YYYY-MM-DD'),
	  filter: "%U-%Y",
	  orderStatus:"all"
	}
  }).then((e) => {
	console.log(e)
	let {saleReport}=e.data
    saleReport = saleReport.map((el) => {
		let newOne={}
		newOne.x=el._id
		newOne.y=el.count
        return newOne;
      })
	
	
	

    
		"use strict";
		
	// apexchart4
var options = {
	chart: {
	  type: 'bar'
	},
	plotOptions: {
		bar: {
			columnWidth: '50%'}
	},		
	series: [{
	  data: saleReport
	}]
  }
var chart = new ApexCharts(document.querySelector("#apexchart4"), options);
chart.render();

})


axios.get('/admin/salesProject', {
	params: {
	  from: "2020-01-11",
	  to:moment(new Date()).format('YYYY-MM-DD'),
	  filter: "%m"
	}
  }).then((e) => {
	let {saleReport}=e.data
	console.log(saleReport)
	let monthlySales = [];
    let monthlyProfit = [];
    let datedata = [];

    for (let i = 0; i < saleReport.length; i++) {
        monthlySales.push(saleReport[i].totalPrice);
        monthlyProfit.push((saleReport[i].totalPrice * 10) / 100)
        datedata.push(saleReport[i]._id);
    }
	
	

    
		"use strict";

		// apexchart2
var options = {
	series: [{
	name: 'Monthly Sales',
	data: monthlySales,
  },{
	name: 'Monthly Profit',
	data: monthlyProfit,
  }],
	chart: {
	height: 350,
	type: 'radar',
  },
  title: {
	text: ''
  },
  xaxis: {
	categories:datedata 
  }
  }
var chart = new ApexCharts(document.querySelector("#apexchart2"), options);
chart.render();


    
		

    
	


})

axios.get('/admin/salesProject', {
	params: {
	  from: "2020-01-11",
	  to:moment(new Date()).format('YYYY-MM-DD'),
	  donutchart:true
	}
  }).then((e) => {
	let {saleReport}=e.data
	let percent
	let data
	if(saleReport[1]){
	 percent = [(((saleReport[0].count)/(saleReport[0].count+saleReport[1].count))*100),((saleReport[1].count)/(saleReport[0].count+saleReport[1].count))*100]
     data = [saleReport[0]._id,saleReport[1]._id];
}   
else{
	percent=percent = [100]
	data = [saleReport[0]._id]
}
        

	
	

    
		"use strict";

// apexchart3
var options = {
	series: percent,
	chart: {
	width: 500,
	type: 'donut',
  },
  plotOptions: {
	pie: {
	  startAngle: -90,
	  endAngle: 270
	}
  },
  labels: data,
  dataLabels: {
	enabled: true,
  },
  fill: {
	type: 'gradient',
  },
  legend: {
	formatter: function(val, opts) {
	  return val + " - " + opts.w.globals.series[opts.seriesIndex]
	}
  },
  title: {
	text: ''
  },
  responsive: [{
	breakpoint: 480,
	options: {
	  chart: {
		width: 200
	  },
	  legend: {
		position: 'bottom'
	  }
	}
  }]
  };
var chart = new ApexCharts(document.querySelector("#apexchart3"), options);
chart.render();



    
		

    
	


})




})
