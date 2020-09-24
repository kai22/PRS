import "./stylesheets/main.css";
import "./stylesheets/bootstrap.min.css";

// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------

import { remote } from "electron";
import jetpack from "fs-jetpack";
import env from "env";

const path = require('path');
const app = remote.app;

const Vue = require('vue/dist/vue.min.js');
const R = require('ramda/dist/ramda.min.js');
const csv = require('csv-parser');
const { parse } = require('json2csv');

// import 
// use an alias for my stuff
// import * as prs from "./prs/prs"


let desktopPath = path.join(app.getAppPath(), '../../../../../../Desktop');

if(jetpack.exists(desktopPath) == false){
	
	 desktopPath = path.join(app.getAppPath(), '../../');
}

const appDir = jetpack.cwd(path.join(desktopPath, 'PRS')); 
const preferences = appDir.read('prefs.json','json');

const database = preferences.database;
const main_dump = preferences.dump;
const monthlyFolder = preferences.monthly;
const imagesDir = preferences.images;


//setup neDB so we can ditch the excel sheets 


let vtemplates = {
	job:/*html*/`
		<div>
			<strong>Name of Input File:</strong>
			<!-- input type="text" name="filename" maxlength="15" size="15" v-model="$root.jobOptions.filename" -->

			<select name="filename" v-model="$root.jobOptions.filename" style="width:150px">
				<option v-for="(opt,index) in $root.mlist">
					{{opt}}
				</option>

			</select>

			<br><br>

			<strong>Project Type:</strong>
			<select name="code" v-model="$root.jobOptions.project">
				<option selected >Choose one:</option>
				<option>Monthly</option>
				<option>Price Book</option>
				<option>Line Drive</option>
			</select>

			<br><br>

			<strong>Display:</strong><br>
			<input type="radio" name="display" value='text' v-model="$root.jobOptions.display"> Text Listing<br>
			<input type="radio" name="display" value='block' v-model="$root.jobOptions.display"> Block Listing<br>
			<input type="radio" name="display" value='none' v-model="$root.jobOptions.display"> No Listing<br>

			<br>
		
			<input type="checkbox" name="write" value='1' v-model="$root.jobOptions.writeCSV"> <b>Write output CSV file </b><br><i>(formated for Indesign soon!)</i>

			<br><br>
			<button @click="$root.submitJob()">Do It!</button>
		</div>`,

	jobcomp:`
		<div>
			<error-msgs></error-msgs>
			<br>
			<job-section></job-section>
			<br>
		</div>`,

	boxResults:`
		<div>
			Results
			<br>
			<div style="width:175px;height:175px;border:1px solid #000000;font-size:12px;float:left;margin-right:5px" v-for="(box,index) in $root.parseMonthly">
				{{box.bsku}}<br />
				{{box.manufac}}<br />
				{{box.name}}<br />
				{{box.price}}<br />
				{{box.cpDesc}}<br />
				<img v-bind:src="$root.getPhotoDir(box.photo)" width="35%" height="35%" align="absmiddle" />
			</div>
		</div>`,
	textResults:`
		<div>
			Results
			<br>
			<div v-for="(box,index) in $root.parseMonthly">
				<div style='width:90%;background-color: #ddffdd'><span style='line-height:2'>
				<b>#{{index}}</b> : {{box.bsku}} <b>{{box.manufac}}</b> - {{box.name}}  <i>-- {{box.cpDesc}}</i></span>
				</div>
			</div>
		</div>`,

	errors:`
		<div>
			<div id="noFilename" class="error" style="display:none">Please define the source file.</div>
			<div id="noCode" class="error" style="display:none">Please define the Project type.</div>
			<div id="noSource" class="error" style="display:none">The source file does not exist.</div>
			<div id="noDisplay" class="error" style="display:none">Please choose a display type.</div>
		</div>`,

	block:`
		<div>
			<div>

				<slot></slot>

			</div>
		</div>`,

	text:`
	
	`,
	
 }


let vueComps = [

	{
			"name":'job-section',
			"props":[],
			"html":'job'
  	},

	{
			"name":'job-screen',
			"props":[],
			"html":'jobcomp'
	},
	{
			"name":'box-results',
			"props":[],
			"html":'boxResults'
	},
	{
			"name":'text-results',
			"props":[],
			"html":'textResults'
	},
	{
			"name":'error-msgs',
			"props":[],
			"html":'errors'
	},

  	{
			"name":'block-wrap',
			"props":[],
			"html":'block'
  	}
]


function vComp(arr){

    R.forEach(function(n){
      
      var y = R.filter(function(x){ return x.name == n}, vueComps)[0];

      Vue.component(y.name, {
        props:y.props,
        template:vtemplates[y.html],
      });

    }, arr);
};

vComp([

      "job-section",
      "job-screen",
      "error-msgs",
	  "block-wrap",
	  "box-results",
	  "text-results"
    ]);


//setup Vue :: controls the front-end

global.atom = new Vue({

	el:"#app",

	data:{

		database:[],
		maindump:[],
		rawProds:[],
		mlist:[],
		monthly:[],
		result:[],

		comp:'',
		jobOptions:{
			'filename':'',
			'project':'',
			'display':'',
			'writeCSV':'',
			'imageList':''
		},
		screens:{

			'title':'title-screen',
			'runjob':'job-screen',
			'block':'box-results',
			'text':'text-results',
			'editor':'edit-screen'
		},

		blocks:{
			
			'smallBlock':0,
			'bigBlockFront':0,
			'bigBlockBack':0,
			'bigBlockInside':0
		}
	},

	created:function(){

		var vm = this;

		vm.$set(vm,'maindump', vm.convertCSV(main_dump));
		vm.$set(vm,'database', vm.convertCSV(database));

		let mf = appDir.list(appDir.path(monthlyFolder));

		vm.$set(vm, 'mlist', mf);

	},

	mounted:function(){

		var vm = this;

		vm.$set(vm,'comp',vm.screens['runjob']);

		console.log(desktopPath);
	
	},
	computed:{

		parseMonthly: function(){

			let vm = this;

			return R.map(function(n){

				let x = vm.getProduct(n.product_ids[0], vm.database);
				let o = vm.makeMonthlyProduct(x, n);

				if(o.manufac.match(/not found/g) !== null){
					vm.rawProds.push(vm.getProduct(n.product_ids[0], vm.maindump));
				}

				return o;

			}, vm.monthly);
		},
	},

	methods:{

		getPhotoDir:function(p){

				if(jetpack.exists(imagesDir+p)){

					return path.join(appDir.path('images'), 'checkmark.jpg');

				} else {

					return path.join(appDir.path('images'), 'no_image.jpg');
				}
		
	  	},

		convertCSV:function(file){

			var vm = this;
			var result = [];

			appDir.createReadStream(file)
				.pipe(csv())
				.on('data', (data) => result.push(data))
				
				return result;
		},


		monthlyJob:function(){

			let vm = this;

			let monthly = [];
				
			appDir.createReadStream((path.join(appDir.path(monthlyFolder), vm.jobOptions.filename)))
				.pipe(csv())
				.on('data', (data) => monthly.push(data))
				.on('end', () => {

					monthly = R.map(function(n){

						n.product_ids = n.product_ids.split(',');
						n.bonus = n.bonus ? `${n.bonus}_icon.jpg` : '';
						return n;

					}, monthly);

					vm.$set(vm,'monthly', monthly);


					vm.comp = vm.screens[vm.jobOptions.display];


					if(vm.jobOptions.writeCSV == true){
						vm.saveResults(vm.parseMonthly);
					}

				});

		},

		priceBookJob:function(){



		},

		lineDriveJob:function(){



		},


		submitJob:function(){

			let vm = this;

			let jobs = {

				"Monthly" : "monthlyJob",
				"Price Book" : "priceBookJob",
				"Line Drive" : "lineDriveJob"
			}

			if(vm.jobOptions.filename && vm.jobOptions.project && vm.jobOptions.display){ // && vm.jobOptions.writeCSV){

				vm[jobs[vm.jobOptions.project]]()

			} else {


			}

		},

		makeMonthlyProduct: function(n,item){

			let vm = this;
			let num = Array.isArray(item.product_ids) ? item.product_ids.length : 1;
			let prodID = num > 1 ? item.product_ids[0] : item.product_ids;

			let obj = {
				"alpha":item.alpha,
				"bsku":n ? n.Bsku : prodID,
				"photo":`${n.Bsku}.jpg`,
				"manufac":n ? n.Manufac : `Product ${prodID} not found`,
				"flavor":n ? n.Flavor : '',
				"name":n ? n.Name : '',
				"size":n ? n.Size : '',
				"bonus":item.bonus ? item.bonus : '',
				"note": n ? `Minimum ${n.Minimum} pcs<\\#13>` : '',
				"cpDesc": num > 1 ? `${num} children` : 'Single Product',
				"price":item.price,
				"each":"<\\#13>each",
				"code": "Code BH",
				"children":""
			}

			switch (obj.manufac.trim()) {
        
				case 'Motions Professional':
					obj.manufac = `${obj.manufac}<V><f"FuturaStd-Book">1<V>`;
					obj.note = `${obj.note}<f"FuturaStd-Book">1 B&B Only`;
					break;
				case 'ApHogee':
					obj.manufac = `${obj.manufac}<V><f"FuturaStd-Book">1<V>`;
					obj.note = `${obj.note}<f"FuturaStd-Book">1 B&B Only`;
					break;
				case 'Clairol':
					obj.manufac = `${obj.manufac}<V><f"FuturaStd-Book">1<V>`;
					obj.note = `${obj.note}<f"FuturaStd-Book">1 B&B Only`;
					break;
				case 'Beautiful Collection':
					obj.manufac = `${obj.manufac}<V><f"FuturaStd-Book">1<V>`;
					obj.note = `${obj.note}<f"FuturaStd-Book">1 B&B Only`;
					break;
				case '*Clairol':
					obj.manufac = `${obj.manufac}<V><f"FuturaStd-Book">1<V>`;
					obj.note = `${obj.note}<f"FuturaStd-Book">1 B&B Only`;
					break;
				case 'Wella Color Charm':
					obj.manufac = `${obj.manufac}<V><f"FuturaStd-Book">1<V>`;
					obj.note = `${obj.note}<f"FuturaStd-Book">1 B&B Only`;
					break;
				case 'Aphogee':
					obj.manufac = `${obj.manufac}<V><f"FuturaStd-Book">1<V>`;
					obj.note = `${obj.note}<f"FuturaStd-Book">1 B&B Only`;
					break;
				case '*Aphogee':
					obj.manufac = `${obj.manufac}<V><f"FuturaStd-Book">1<V>`;
					obj.note = `${obj.note}<f"FuturaStd-Book">1 B&B Only`;
					break;
				default:
					obj.manufac = obj.manufac.trim();
					break;
    
    		}


			if(obj.manufac[0] === "*"){

				obj.each = "display<\\#13>($0.00 each)";
				obj.note = `${obj.note} *Order as 1 unit<\\#13>`;
				obj.manufac = `${obj.manufac[1]}${obj.manufac}`;
			}


			let pos = obj.price.search("p");

			if(pos !== -1){
		
				obj.code = "Code BH-P";
				obj.price = obj.price.substr(0, pos);
			}


			if(num > 1){ //make the children
			
				let c = R.map(function(k){

					var x = vm.getProduct(k, vm.database);
					var str = '';

					if(x.Manufac){
						str = `#${x.Bsku} ${x.Flavor ? x.Flavor : x.Name} ${x.Size}`;
					
					}else{
						str = `Product ${k} not found.`;

						vm.rawProds.push(vm.getProduct(k, vm.maindump));
					}

					return str;

				}, item.product_ids);

				obj.children = R.join('<\#13>', c);

			} else { 

				obj.name = `${obj.name} ${obj.size}`;
				obj.children = `#${obj.bsku}`;

			}

			return obj;

		},

		makePBProduct:function(){


		},


		getProduct:function(id, db){
			return R.find(R.propEq('Bsku', id))(db);
		},

		saveResults:function(data){

			let csv = parse(data);
			appDir.write('results.csv', csv);

		}
	}

})


