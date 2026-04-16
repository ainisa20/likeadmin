function e(s){return console.log("发送请求前 data:",s),$request.post({url:"/api/assessment/submit",params:s})}export{e as submitAssessment};
