Date.prototype.getDateString = function() {
	return ((this.getMonth()>8)?"":"0") + (this.getMonth()+1) + "/" + ((this.getDate()>9)?"":"0") + this.getDate();
};

Date.prototype.getTimeString = function() {
	return ((this.getHours()>9)?"":"0") + (this.getHours()) + ":" + ((this.getMinutes()>9)?"":"0") + this.getMinutes();
};

var app = new Vue({
	el: '#app',
	data: {
		days: [],
		schedule: {},
		rooms: [],
		times: [],
		selected: 0
	},
	methods: {
		fetchData: function(data) {
			for (var event of data) {
				event['start'] = new Date(event['start']);
				event['end']   = new Date(event['end']);
				var day = event['start'].getDateString();
				if (!(this.days.includes(day))) {
					this.days.push(day);
					this.days.sort();
					this.schedule[day] = {start:null, end:null, events: {}};
				}
				if (!(this.rooms.includes(event['room']))) {
					this.rooms.push(event['room']);
					this.rooms.sort();
				}
				event['minutes'] = (event['end'] - event['start'])/6e4;
				if (this.schedule[day]['start'] == null || this.schedule[day]['start'] > event['start']) {
					this.schedule[day]['start'] = event['start'];
					if (this.schedule[day]['start'].getMinutes() > 0) {
						this.schedule[day]['start'] = new Date(this.schedule[day]['start'] - this.schedule[day]['start'].getMinutes()*6e4);
					}
				}
				if (this.schedule[day]['end'] == null || this.schedule[day]['end'] < event['end']) {
					this.schedule[day]['end'] = event['end'];
					if (this.schedule[day]['end'].getMinutes() > 0) {
						this.schedule[day]['end'] = new Date(this.schedule[day]['end'] - (60-this.schedule[day]['end'].getMinutes())*-6e4);
					}
				}
				if (!this.schedule[day]['events'][event['room']]) {
					this.schedule[day]['events'][event['room']] = [];
				}
				this.schedule[day]['events'][event['room']].push(event);
			}
			this.plotTime()
			$('.loading').hide();
		},
		generateStyle: function(event) {
			var day = this.days[this.selected];
			var start = event['start'].getHours()*60+event['start'].getMinutes();
			var startOfDay = this.schedule[day]['start'].getHours()*60+this.schedule[day]['start'].getMinutes();
			return 'top:'+(300/60*(start-startOfDay))+'px;'+
				'height:'+(300/60*event['minutes'])+'px;'+
				'min-height:'+(300/60*event['minutes'])+'px';
		},
		plotTime: function() {
			var day = this.days[this.selected];
			this.times = [];
			for (var hour=this.schedule[day]['start'].getHours(); hour <= this.schedule[day]['end'].getHours(); hour++) {
				this.times.push(((hour<9)?'0':'')+hour+':00')
			}
		},
		launch: function(event) {
			$('#eventDetail .title').text(event['subject'])
			$('#eventDetail .speaker').text(event['speaker']['name'])
			$('#eventDetail .modal-body').text(event['summary'])
			$('#eventDetail .time').text(event['start'].getTimeString()+' - '+event['end'].getTimeString())
		}
	},
	watch: {
		selected: function() {
			this.plotTime()
		}
	},
	mounted: function() {
		$.getJSON( "https://coscup.org/2018-assets/json/submissions.json", this.fetchData);
	}
});
