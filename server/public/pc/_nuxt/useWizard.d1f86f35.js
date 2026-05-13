import{q as D,C,aL as b,bU as O,bV as j}from"./entry.9974698b.js";function S(){try{const{public:r}=O(),a=r.baseUrl||"/";return a.endsWith("/")?a:a+"/"}catch{return"/"}}const w=()=>({active:!1,currentStep:1,error:null,directionInput:"",isMatching:!1,matchResult:null,themeIndex:[],selectedThemeId:"",themeData:null,selectedScopeIds:[],identity:{name:"",phone:"",identityType:"",registerArea:""},team:{budget:"",employeeCount:""},tech:{needServer:!0,aiCallsPerDay:""},plan:{registerTime:"",services:[]},isGenerating:!1,generatedContent:"",generationComplete:!1,subsidyCalculated:!1}),e=D(w());function v(){const{getUserId:r}=j();return r()}async function T(){try{const r=S(),a=await fetch(`${r}themes/index.json`);if(!a.ok)throw new Error("Failed to load theme index");e.themeIndex=await a.json()}catch(r){e.error="加载主题数据失败",console.error("[Wizard] loadThemeIndex failed:",r)}}async function x(r){e.isMatching=!0,e.error=null;try{const a=b().config,y=`请从以下84个创业主题中，为用户的创业描述选择最匹配的1-3个主题。

## 主题列表
${e.themeIndex.map((i,c)=>`${c+1}. ${i.themeName} (${i.category})`).join(`
`)}

## 用户的创业描述
${r}

## 要求
严格返回JSON，不要任何其他文字：
{"matches":[{"themeName":"主题名","category":"分类","confidence":0.95,"reason":"匹配理由(不超过30字)"}]}
规则：必须从列表中选择，不要自创；最多3个最少1个；confidence范围0-1。`,p=await fetch(`${a.baseUrl.replace(/\/$/,"")}/v1/chat-messages`,{method:"POST",headers:{Authorization:`Bearer ${a.opcToken}`,"Content-Type":"application/json"},body:JSON.stringify({query:y,response_mode:"blocking",user:v(),inputs:{}})});if(!p.ok){const i=await p.text();throw new Error(`HTTP ${p.status}: ${i}`)}const u=((await p.json()).answer||"").match(/\{[\s\S]*\}/);if(u)e.matchResult=JSON.parse(u[0]);else throw new Error("无法解析匹配结果")}catch(a){e.error=`主题匹配失败: ${a.message}`,console.error("[Wizard] matchDirection failed:",a)}finally{e.isMatching=!1}}async function k(r){e.selectedThemeId=r,e.selectedScopeIds=[];try{const a=S(),l=await fetch(`${a}themes/${r}.json`);if(!l.ok)throw new Error("Failed to load theme data");e.themeData=await l.json()}catch(a){e.error="加载经营范围数据失败",console.error("[Wizard] selectTheme failed:",a)}}async function A(){try{const r={graduate:"graduate",opc:"opc",student:"student",both:"both"},a={luohu:"luohu",longgang:"longgang",guangming:"guangming",nanshan:"nanshan",其他:"other"},l=r[e.identity.identityType]||"other",y=a[e.identity.registerArea]||"other",p=e.team.employeeCount||"0",m={identity:l,region:y,employee:p};e.tech.aiCallsPerDay&&(m.needServer=e.tech.needServer,m.aiCallsPerDay=e.tech.aiCallsPerDay,m.budget=e.team.budget);const u=await(await fetch("/api/calculate/calculate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(m)})).json();if(!u.code||u.code!==1){console.error("[Wizard] calculate API error:",u);return}const i=u.data,c=n=>n>=1e4?`${(n/1e4).toFixed(1)}万`:`${n.toLocaleString()}元`;let o=`

## 五、可申领补贴与收益预估

`;o+=`**保守估算（普惠易得）：** ${c(i.total_low)} ~ ${c(i.total_high)}

`,o+=`> 💡 若满足条件，总补贴上限可达 ${c(i.total_high_all)}

`;const g=i.subsidies.filter(n=>!n.is_advanced),$=i.subsidies.filter(n=>n.is_advanced);if(g.length>0){o+=`### 🏆 普惠易得补贴

`,o+=`| 补贴项目 | 估算金额 | 条件/备注 |
`,o+=`|---------|---------|----------|
`;for(const n of g)o+=`| ${n.name} | ${c(n.amount_low)} ~ ${c(n.amount_high)} | ${n.condition} |
`;o+=`
`}if($.length>0){o+=`### 🚀 高难度专项补贴

`,o+=`| 补贴项目 | 估算金额 | 条件/备注 |
`,o+=`|---------|---------|----------|
`;for(const n of $)o+=`| ${n.name} | ${c(n.amount_low)} ~ ${c(n.amount_high)} | ${n.condition} |
`;o+=`
`}o+=`### 💸 前期6个月必要投入成本

`,o+=`| 项目 | 估算金额 | 说明 |
`,o+=`|------|---------|------|
`;for(const n of i.costs)o+=`| ${n.name} | ${n.amount} | ${n.note} |
`;o+=`
`,o+=`> 💡 最低总投入约 ${c(37339)} 元

`,o+=`### 📊 投入产出分析（净收益）

`,o+=`- **总投入（最低配置）：** 约 ${c(37339)} 元（6个月）
`,o+=`- **减去普惠补贴：** -${c(i.total_low)}
`,o+=`- **净收益（保守）：** ${i.net_benefit}

`,o+=`> 💳 **可叠加创业担保贷款：** ${i.loan_info}`;let t="";if(i.tech_plan){const n=i.tech_plan;if(t=`

## 三、技术方案与成本估算

`,n.need_server&&n.servers){const s=n.servers.recommended;t+=`### ☁️ 推荐云服务器配置

`,t+=`> 基于 ${s.provider} 实际定价推荐

`,t+=`| 配置项 | 详情 |
`,t+=`|-------|------|
`,t+=`| 推荐方案 | **${s.name}** |
`,t+=`| 规格 | ${s.spec} |
`,t+=`| 年费 | ${s.yearly_cost}元/年（约${s.monthly_cost}元/月） |
`,t+=`| 适用场景 | ${s.suitable_for} |
`,t+=`
`,t+=`#### 其他可选配置

`,t+=`| 方案 | 规格 | 年费 | 适用场景 |
`,t+=`|------|------|------|----------|
`;for(const[,d]of Object.entries(n.servers.all_configs))t+=`| ${d.name} | ${d.spec} | ${d.yearly_cost}元/年 | ${d.suitable_for} |
`;t+=`
`}else t+=`### ☁️ 云服务器

`,t+=`当前阶段暂不需要云服务器，建议先使用免费开发环境验证业务模型。

`;if(n.ai_tools){const s=n.ai_tools,d=s.models[s.recommended_model];t+=`### 🤖 AI 模型与工具链

`,t+=`> 推荐模型：**${d.name}**（${d.provider}）

`,t+=`| 模型 | 提供商 | 输入价(元/百万Token) | 输出价(元/百万Token) | 适用场景 |
`,t+=`|------|-------|--------------------|--------------------|----------|
`;for(const[,f]of Object.entries(s.models)){const P=f.name===d.name?" ⭐推荐":"";t+=`| ${f.name}${P} | ${f.provider} | ${f.input_price} | ${f.output_price} | ${f.suitable_for} |
`}if(t+=`
`,s.monthly_cost>0&&(t+=`> 💰 按日均调用估算，月费约 **${s.monthly_cost}元/月**

`),s.free_options&&s.free_options.length>0){t+=`**省钱提示：**
`;for(const f of s.free_options)t+=`- ${f}
`;t+=`
`}}if(n.dev_tools){const s=n.dev_tools;t+=`### 🛠️ 开发工具链

`,t+=`| 工具 | 费用 | 说明 |
`,t+=`|------|------|------|
`;for(const d of s.items)t+=`| ${d.name} | ${d.cost} | ${d.note} |
`;t+=`
`}t+=`### 💰 技术方案月度成本汇总

`,t+=`| 项目 | 月费 | 备注 |
`,t+=`|------|------|------|
`;for(const s of n.monthly_breakdown){const d=s.cost===0?"**0元**":`${s.cost}元`;t+=`| ${s.item} | ${d}/月 | ${s.note||""} |
`}t+=`| **合计** | **${n.monthly_cost}元/月（${n.yearly_cost}元/年）** | |
`}else t=`

## 三、技术方案

> 技术方案需根据实际云服务配置和AI调用量定制，请联系顾问获取详细方案。
`;const h=`

## 四、OPC创业·全栈服务包（仅需3200元）

| 服务模块 | 服务内容 | 市场价 |
|---------|---------|-------|
| 🏢 企业代注册 | 核名、工商登记、执照领取、印章刻制、银行开户咨询 | 1000元/套 |
| 📊 代记账报税 | 账务处理、纳税申报、年度汇算清缴 | 2200元/年 |
| 🦞 基础OPC部署 | 环境配置、工具链安装、私有化部署、安全加固建议 | 0元 |
| 📈 营销获客渠道建设 | 新媒体账号搭建、内容策略指导、AI获客工具配置 | 899元/套 |
| 🎓 创业辅导服务 | 商业计划书优化、补贴申请指导、财税合规咨询 | 399元起/年 |

> ⭐ **增值服务：** 全程免费指导各项政府补贴申请，直至补贴到账

> 💰 以上基础服务包总价仅需 **3200元**
`,I=`

## 六、下一步行动清单（含时间节点）

| 阶段 | 时间节点 | 行动项 | 具体操作 | 产出/里程碑 |
|------|---------|--------|---------|-------------|
| 工商固化 | 第 1 周 | 完成企业注册、印章刻制 | 使用 OPC 全栈服务包（含代注册）提交核名、材料；领取执照、刻章 | 营业执照、公章、财务章 |
| 账户与社保 | 第 1-2 周 | 银行对公开户、社保登记 | 预约银行开户（部分免费），开通企业对公账户；在深圳社保局官网完成单位参保登记 | 对公账户、社保单位编号 |
| 技术上线 | 第 2-3 周 | 部署基础 OPC 环境 | 使用服务包提供的云服务器（38元/年）、域名（1元起），完成私有化部署 | 可访问的 AI 服务 Demo |
| 社保启动 | 第 3 周 | 为法定代表人（自己）缴纳社保 | 以公司名义开始缴纳养老、医疗等社保，确保连续不中断 | 社保缴费记录 |
| 补贴首申 | 第 3-4 个月 | 申请社保补贴、场租补贴 | 社保缴满3个月后，通过"深圳市公共就业服务平台"提交社保补贴、场租补贴申请 | 首批补贴到账（季度发放） |
| 初创补贴 | 第 6 个月 | 申请初创企业补贴 | 社保连续满6个月后，提交初创企业补贴申请（1万元一次性） | 初创补贴到账 |
| 带就业补贴 | 第 6-9 个月 | 落实带动就业，申领补贴 | 与被带动员工签订1年合同、缴纳社保满6个月后，提交带动就业补贴 | 按人数获得 2000-3000元/人 |
| 💬 咨询下单 | 随时 | 联系顾问获取一对一指导 | 致电九章数智顾问，获取全栈服务包及补贴申请指导 | 专属顾问对接 |

> 📞 **联系顾问：** 九章数智（彭生/电话：135-7087-9523，备注"OPC创业"优先通过）
`;e.generatedContent+=`
`,e.generatedContent+=t,e.generatedContent+=h,e.generatedContent+=o,e.generatedContent+=I,e.generatedContent+=`

---

*本报告由九章数智人工智能（深圳）有限责任公司出具，基于提供的信息及现行政策分析。*`,z(),N(i),e.subsidyCalculated=!0}catch(r){console.error("[Wizard] appendSubsidyCalculation failed:",r)}}function z(){const r=b();for(let a=r.messages.length-1;a>=0;a--){const l=r.messages[a];if(l.role==="assistant"&&l.source==="opc"){l.content=e.generatedContent;break}}}async function N(r){var a;try{await fetch("/api/wizard_report/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e.identity.name,phone:e.identity.phone,direction:e.directionInput,identityType:e.identity.identityType,region:e.identity.registerArea,budget:e.team.budget,employeeCount:e.team.employeeCount,needServer:e.tech.needServer,aiCalls:e.tech.aiCallsPerDay,registerTime:e.plan.registerTime,services:e.plan.services,themeName:((a=e.themeData)==null?void 0:a.themeName)||"",scopeIds:e.selectedScopeIds,reportContent:e.generatedContent,subsidyData:{total_low:r.total_low,total_high:r.total_high,subsidies:r.subsidies},techData:r.tech_plan||null})})}catch(l){console.error("[Wizard] saveReport failed:",l)}}async function W(r,a){e.isGenerating=!0,e.error=null;try{const l=b().config,y=e.selectedScopeIds.map(c=>{const o=e.themeData.items.find(g=>g.scopeId===c);return o?`${o.standardItem}(${o.scopeCode},${o.permitType===0?"无需许可":"需许可"})`:""}).filter(Boolean).join("; "),p=`请根据以下创业信息，生成完整的《九章数智·OPC创业落地分析报告》。

## 创业方向
主题：${e.themeData.themeName}
分类：${e.themeData.category}
业务描述：${e.directionInput}

## 选定经营范围
${y}

## 身份信息
姓名：${e.identity.name}
身份：${e.identity.identityType}
注册区域：${e.identity.registerArea}

## 团队与资金
启动资金：${e.team.budget}
预计带动就业人数：${e.team.employeeCount}

## 技术需求
云服务器：${e.tech.needServer?"需要":"不需要"}
AI日均调用：${e.tech.aiCallsPerDay}

## 规划
注册时间：${e.plan.registerTime}
代办服务：${e.plan.services.join("、")}

## 报告结构要求
一、公司命名建议
请基于用户提供的行业属性、创始人信息、地域特点，按以下流程输出：  

1. **风格诊断与推荐**  
   根据用户提供的信息，分析并推荐 几个适合的品牌风格调性，并简要说明推荐理由。

2. **生成 5-8 个公司名称**  
   每个名称包含以下四项内容：  
   - **名称**：中文名 
   - **寓意**（30 字以内）  
   - **核名提示**：基于注册规范评估重名风险、通过率预估  
   - **与用户信息的关联**：说明该名称如何结合了"姓名 / 地域 / 业务 " 

二、经营范围建议及冲突预检（表格列出规范表述|是否需前置许可|匹配度|风险提示 + 冲突预警 + 结论，最后一句话输出建议注册使用的经营范围描述）

## 格式要求
- 流作图：仅在绝对必要展示复杂步骤关系时，可使用 ASCII art 文本图（字符限用 │ ▼ ─ ┌ ┐ └ ┘ 等），**否则优先使用文字描述、列表、表格**。绝对禁止输出 mermaid / graph / flowchart 代码。
- 数据对比统一使用 Markdown 表格。
- **二之后不要输出任何内容，报告到二结束**`,m=await fetch(`${l.baseUrl.replace(/\/$/,"")}/v1/chat-messages`,{method:"POST",headers:{Authorization:`Bearer ${l.opcToken}`,"Content-Type":"application/json"},body:JSON.stringify({query:p,response_mode:"streaming",user:v(),inputs:{}})});if(!m.ok){const c=await m.text();throw new Error(`HTTP ${m.status}: ${c}`)}const _=m.body.getReader(),u=new TextDecoder;let i="";for(;;){const{done:c,value:o}=await _.read();if(c)break;i+=u.decode(o,{stream:!0});const g=i.split(`
`);i=g.pop()||"";for(const $ of g)if($.startsWith("data: ")){const t=$.slice(6).trim();if(!t||t==="[DONE]")continue;try{const h=JSON.parse(t);h.event==="message"&&h.answer?(e.generatedContent+=h.answer,r(h.answer)):h.event==="message_end"&&h.conversation_id&&(e.generationComplete=!0,a(h.conversation_id),setTimeout(()=>A(),2e3))}catch{}}}}catch(l){e.error=`报告生成失败: ${l.message}`,console.error("[Wizard] generateReport failed:",l)}finally{e.isGenerating=!1}}function M(){e.currentStep<6&&e.currentStep++}function R(){e.currentStep>1&&e.currentStep--}function U(){Object.assign(e,w()),e.active=!0,T()}function J(){e.active=!1}const B=C(()=>e.themeData?e.selectedScopeIds.map(r=>e.themeData.items.find(a=>a.scopeId===r)).filter(Boolean):[]),E=C(()=>{switch(e.currentStep){case 1:return e.selectedScopeIds.length>0;case 2:return!!(e.identity.name&&e.identity.identityType&&e.identity.registerArea);case 3:return!!(e.team.budget&&e.team.employeeCount);case 4:return!!e.tech.aiCallsPerDay;case 5:return!!(e.plan.registerTime&&e.plan.services.length>0);default:return!0}});function q(){return{state:e,startWizard:U,cancelWizard:J,loadThemeIndex:T,matchDirection:x,selectTheme:k,generateReport:W,nextStep:M,prevStep:R,selectedScopeItems:B,canProceedFromStep:E}}export{q as u};
