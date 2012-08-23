
(function($, undefined ) {
	$.widget( "mobile.dvcCalendar", $.mobile.dvcBase, {
		options: {
			schedule_visible:"hide", //hide, show
			weekfocus_visible:"hide", //hide, show
			dayfocus_visible:"hide", //hide, show
			todayfocus_visible:"hide" //hide, show
		},
		
		_create: function(){
			var $el = this.element, self = this,
			o = this.options;
			
			$el.addClass("dvc-calendar");
			
			//scrollview에서 event받기 위해 수정 hj 120619
			self._findScrollview();
		
			if(self.scrollview) {
				self.scrollview.delayedClickSelector(".dvc-calendar *");
			}
			
			var table = $("<table style='position:absolute; left:0px; top:0px; border-spacing: 0px 0px; width:100%; height:100%;'></table>");
			var thead = $("<thead style='width:100%'><tr class='dvc-calendar-head' style='width:100%;height:30px;font-size:12px;color:#fff;'> \
							<td class='dvc-calendar-head-content' style='text-align:center;width:15%;padding:0;'>일</td> \
							<td class='dvc-calendar-head-content' style='text-align:center;width:14%;padding:0;'>월</td> \
							<td class='dvc-calendar-head-content' style='text-align:center;width:14%;padding:0;'>화</td> \
							<td class='dvc-calendar-head-content' style='text-align:center;width:14%;padding:0;'>수</td> \
							<td class='dvc-calendar-head-content' style='text-align:center;width:14%;padding:0;'>목</td> \
							<td class='dvc-calendar-head-content' style='text-align:center;width:14%;padding:0;'>금</td> \
							<td class='dvc-calendar-head-content' style='text-align:center;width:15%;padding:0;'>토</td> \
							</tr></thead>");
			var tbody = $("<tbody style='height:100%'></tbody>");
			
			var tr = "<tr class='dvc-calendar-body ";			
			var td = $("<td><div class='dvc-calendar-check'><div class='dvc-calendar-text'>1</div></div></td>");
			
			for(var tr_i=1; tr_i<7;tr_i++)
			{
				//add tr
				var tr_clone = $(tr+"dvc-calendar-body-h"+tr_i+"'></tr>");
				//add td
				for(var i=0;i<7;i++) {
					if(i==0) { 
						td.clone().appendTo(tr_clone).addClass("dvc-calendar-sun");						
					}
					else if(i==6) {
						td.clone().appendTo(tr_clone).addClass("dvc-calendar-sat");												
					}
					else {
						td.clone().appendTo(tr_clone).addClass("dvc-calendar-day");						
					}
				}					
				tr_clone.appendTo(tbody);
			}
						
			table.append(thead);
			table.append(tbody);
			$el.append(table);
			
			self._schedule_visible();
			self._weekfocus_visible();
			self._dayfocus_visible();
			self._todayfocus_visible();

			// 설정된 일정
			this.appointments = [];
			
			//공휴일
			this.holidays = [];
			
			this.$calendarBody = $el.find(".dvc-calendar-body");
			
			$el.find(".dvc-calendar-body td").bind("vmousedown", function() {
				var $this = $(this);
				
				// 선택되지 않아야 하는 영역
				if($this.hasClass("dvc-calendar-x")) {
					return;
				}							
				
				$el.find("."+self.focusStyleName).removeClass(self.focusStyleName);						
				
				if(self.options.weekfocus_visible){					
					$el.find(".dvc-calendar-focus-week").each(function(){					
						$(this).removeClass("dvc-calendar-focus-week");
					}); 
					$($this[0].parentElement).addClass("dvc-calendar-focus-week");
				}
				
				//오늘일 경우 포커스 안넣음(오늘 포커스가 우선순위)
				if(!$this.hasClass(self.todayStyleName))
				{$this.addClass(self.focusStyleName);}
				else
				{$this.addClass(self.todayStyleName);}
				
				self.oldFocus = $this;							

				// 선택된 날짜를
				// this.sel_date에 설정한다.
				var text = $this.text();
				self.focus_date = parseInt(text);
				self.focus_year = self.view_year;
				self.focus_month = self.view_month;
				
				// click를 발생시킨다.
				var id = $el[0].id;
				$el.trigger("ev_click", [id, self.getFocusDate()]);
			});
			
			/* 11.07.29 .dvc-calendar-text top 동적으로 할당
			 * var td_height = $el.find("tbody td").eq(0).height();
			var text_height = $el.find("tbody td .dvc-calendar-text").eq(0).height();
			*/
			this.text_top = "0%";

			// 이전선택한 것을 없애는 속도를 개선하기 위해 이전 focus 저장
			this.oldFocus = null;
			
			// 오늘인지 표시하기 위해 저장해둔다.
			this.today = new Date();
			// 현재 달력이 보여지는 년과 월
			this.view_year = this.today.getFullYear();	// 그대로
			this.view_month = this.today.getMonth();	// 월은 0 ~ 11로 실제로 표시하기전에 +1을 하여 사용한다.
			// 초기시에 선택된 날짜(년월일)을 오늘로 저장
			this.focus_year = this.view_year;
			this.focus_month = this.view_month;
			this.focus_date = this.today.getDate();
			
			self._findScrollview();
			this.refresh();

		},		
		
		_schedule_visible: function() {
			var $el = this.element, o = this.options;			
			var type = $el.attr("schedule-visible");
			
			if(!type) {
				type = "hide";
			}
			
			o.schedule_visible = type;
			
			if(o.schedule_visible == "hide") {
				o.schedule_visible = false;							
			}
			else{o.schedule_visible = true;}
			
		},
		
		_weekfocus_visible: function() {
			var $el = this.element, o = this.options;
			
			var type = $el.attr("weekfocus-visible"); 
			if(!type) {
				type = "hide";
			}
			
			o.weekfocus_visible = type;
			
			if(o.weekfocus_visible == "hide") {
				o.weekfocus_visible = false;	
			}
			else{o.weekfocus_visible = true;}
		},
		
		_dayfocus_visible: function() {
			var $el = this.element, o = this.options;
			
			var type = $el.attr("dayfocus_visible");	
			if(!type) {
				type = "hide";
			}
		
			o.dayfocus_visible = type;
			
			if(o.dayfocus_visible == "hide") {
				o.dayfocus_visible = false;	
				this.focusStyleName = "dvc-calendar-focus-hide";
			}
			else{
				o.focusDay_visible = true;
				this.focusStyleName = "dvc-calendar-focus";
			}
		},
		
		_todayfocus_visible: function() {
			var $el = this.element, o = this.options;
			
			var type = $el.attr("todayfocus_visible");	
			if(!type) {
				type = "hide";
			}
		
			o.todayfocus_visible = type;
			
			if(o.todayfocus_visible == "hide") {
				o.todayfocus_visible = false;	
				this.todayStyleName = "dvc-calendar-today-hide";
			}
			else{
				o.todayfocus_visible = true;
				this.todayStyleName = "dvc-calendar-today";
			}
		},
		
		_isToday: function(date) {
			if(this.today.getFullYear() == this.view_year && this.today.getMonth() == this.view_month && this.today.getDate() == date) {
				return true;
			}
			return false;
		},
		
		_isFocus: function(date) {
			if(this.focus_year == this.view_year && this.focus_month == this.view_month && this.focus_date == date) {
				return true;
			}
			return false;
		},
		
		_isAppointment: function(date) {
			var cntAppointment = 0;
			
			for(var i=0;i<this.appointments.length;i++) {
				var ap = this.appointments[i];
				
				if(ap.getFullYear() == this.view_year && ap.getMonth() == this.view_month && ap.getDate() == date) {					
					cntAppointment++;
				}
			}
			
			return (cntAppointment>3)? 3:cntAppointment;
		},
		
		_isHoliday: function(date) {
			for(var i=0;i<this.holidays.length;i++) {
				var ap = this.holidays[i];
				if(ap.getFullYear() == this.view_year && ap.getMonth() == this.view_month && ap.getDate() == date) {
					return true;
				}
			}

			return false;
		},
		
		getViewDate: function() {
			// 현재 보이지는 년월을 Date 객체로 리턴한다.
			return (new Date(this.view_year, this.view_month, 1));
		},
		
		getFocusDate: function() {
			// 현재 보이지는 년월을 Date 객체로 리턴한다.
			return (new Date(this.focus_year, this.focus_month, this.focus_date));
		},		
		
		goToPrevMonth: function() {
			this.view_month--;
			
			// ViewDate를 하여 다시 조절한다.
			var date = this.getViewDate();
			this.view_year = date.getFullYear();
			this.view_month = date.getMonth();
			
			this.focus_year = this.view_year;
			this.focus_month = this.view_month;
			this.focus_date = 1;
								
			this.oldFocus = this.element.find(".dvc-calendar-body td."+self.focusStyleName).eq(0);
			this.refresh();
		},
		
		goToNextMonth: function() {									
			this.view_month++;
			
			// ViewDate를 하여 다시 조절한다.
			var date = this.getViewDate();
			this.view_year = date.getFullYear();
			this.view_month = date.getMonth();
			
			this.focus_year = this.view_year;
			this.focus_month = this.view_month;
			this.focus_date = 1;			
			
			this.oldFocus = this.element.find(".dvc-calendar-body td."+self.focusStyleName).eq(0);
			this.refresh();
		},
			
		
		setCurDate:function(date){
			this.view_year = date.getFullYear();
			this.view_month = date.getMonth();
			
			this.focus_year = date.getFullYear();
			this.focus_month = date.getMonth();
			this.focus_date = date.getDate();
			
			this.oldFocus = this.element.find(".dvc-calendar-body td."+self.focusStyleName).eq(0);
			this.refresh();
		},
		
		setHoliday:function(date){
			this.holidays.push(date);
		},
		
		removeHoliday:function(date){
			this.holidays.remove(date);
		},
		
		removeAllHoliday:function(){
			this.holidays = [];
		},
		
		setAppointment: function(date) {			
			this.appointments.push(date);
		},
		
		removeAppointment: function(date) {
			//this.appointments
			this.appointments.remove(date);
		},
		
		removeAllAppointment:function(){
			this.appointments = [];
		},
		
		refresh: function() {
			$.mobile.dvcBase.prototype.refresh.call(this);
		
			var $el = this.element, self = this;			
			var isSchedule = this.options.schedule_visible;
			var isFocusWeek = this.options.weekfocus_visible;
			var cntAppointment = 0;
						
			// 모든 td의 dvc-calendar-x, dvc-calendar-today, dvc-calendar-focus를 제거한다.
			$el.find(".dvc-calendar-body td").each(function() {
				$(this).removeClass("dvc-calendar-x")
					   .removeClass(self.focusStyleName)
					   .removeClass(self.todayStyleName);
			});
			
			if(isSchedule){
				$el.find(".dvc-calendar-check-o").each(function() {
					$(this).removeClass("dvc-calendar-check-o");
					$(this).removeClass("dvc-calendar-check-o-1");
					$(this).removeClass("dvc-calendar-check-o-2");
					$(this).removeClass("dvc-calendar-check-o-3");
					$(this).removeClass("dvc-calendar-uncheck-o-1");
					$(this).removeClass("dvc-calendar-uncheck-o-2");
					$(this).removeClass("dvc-calendar-uncheck-o-3");
				});												
			}
			
			$el.find(".dvc-calendar-holiday").each(function(){
					$(this).removeClass("dvc-calendar-holiday");
			});

			if(isFocusWeek){
				$el.find(".dvc-calendar-focus-week").each(function(){
					$(this).removeClass("dvc-calendar-focus-week");
				});				
			}
			
			// 현재 달의 첫날과 마지막 날의 Date 객체
			var firstDate = new Date(this.view_year, this.view_month, 1);
			var lastDate = new Date((new Date(this.view_year, this.view_month+1 , 1)).getTime() - (1000*60*60*24));
			
			var firstDayOfWeek = firstDate.getDay();	// 일(0) -> 토(6)
		
			// 이전달의 마지막 주 중 이번 달 1일과 연결되는 시작 일을 구한다.
			var startdate = (new Date(firstDate.getTime() - (1000*60*60*24* firstDayOfWeek))).getDate();
			// startdate가 1이면 이전달 마지막 주는 없는 것임.

			var weekNumber = 0;
			var dayCount = 1;
			
			var $firstRow = this.$calendarBody.eq(weekNumber++);
						    
			if(startdate != 1) {
				var prevDayCount = firstDayOfWeek;				

				$firstRow.find("td").each(function() {
					var $this = $(this);
					
					if(prevDayCount > 0) {
						$this.find(".dvc-calendar-text").text(startdate++);
						$this.addClass("dvc-calendar-x");
						prevDayCount--;
					}
					else {
						$this.find(".dvc-calendar-text").text(dayCount);
												
						// today와 같은면(today와 focus가 겹치면 today 우선)
						if(self._isToday(dayCount)) {						
							$this.addClass(self.todayStyleName);
						}																	
						
						if(self._isFocus(dayCount)) {						
							if(!self._isToday(dayCount))
							{$($this[0]).addClass(self.focusStyleName);}
							if(isFocusWeek)
							{ $firstRow.addClass("dvc-calendar-focus-week");}
						}

						if(isSchedule)
						{					
							cntAppointment = self._isAppointment(dayCount);							
							if(cntAppointment > 0) {
								$this.find(".dvc-calendar-check").addClass("dvc-calendar-check-o")
																 .addClass("dvc-calendar-check-o-"+cntAppointment);								
							}							
						}
						if(self._isToday(dayCount) && isSchedule){
							cntAppointment = self._isAppointment(dayCount);							
							if(cntAppointment > 0) {
								$this.find(".dvc-calendar-check").addClass("dvc-calendar-uncheck-o")
																 .addClass("dvc-calendar-uncheck-o-"+cntAppointment);								
							}
						}
						
						if(self._isHoliday(dayCount)) {
							$this.addClass("dvc-calendar-holiday");
						}
						dayCount++;
					}
				});
			}
			else {
				$firstRow.find("td").each(function() {
					var $this = $(this);
					$this.find(".dvc-calendar-text").text(dayCount);
						
						// today와 같은면(today와 focus가 겹치면 today 우선)
						if(self._isToday(dayCount)) {						
							$this.addClass(self.todayStyleName);								
						}
						
						if(self._isFocus(dayCount)) 
						{						
							if(!self._isToday(dayCount))
							{$($this[0]).addClass(self.focusStyleName);}
							if(isFocusWeek)
							{ $firstRow.addClass("dvc-calendar-focus-week");}
						}
						
						if(isSchedule)
						{
							cntAppointment = self._isAppointment(dayCount);
							if(cntAppointment > 0) {
								$this.find(".dvc-calendar-check").addClass("dvc-calendar-check-o")
																 .addClass("dvc-calendar-check-o-"+cntAppointment);								
							}
						}

						if(self._isToday(dayCount) && isSchedule){
							cntAppointment = self._isAppointment(dayCount);							
							if(cntAppointment > 0) {
								$this.find(".dvc-calendar-check").addClass("dvc-calendar-uncheck-o")
																 .addClass("dvc-calendar-uncheck-o-"+cntAppointment);								
							}
						}
						
						if(self._isHoliday(dayCount)) {
							$this.addClass("dvc-calendar-holiday");
						}					
					dayCount++;
				});

			}					
			
			var lastdate = lastDate.getDate();
			
			var startdate = 1;			 
			do {
				var $Row = this.$calendarBody.eq(weekNumber++);				
				
				$Row.find("td").each(function() {
					var $this = $(this);
					if(lastdate >= dayCount) {
						$this.find(".dvc-calendar-text").text(dayCount);											
						
						// today와 같은면(today와 focus가 겹치면 today 우선)						
						if(self._isToday(dayCount)) {
							$($this[0]).addClass(self.todayStyleName);									
						}
						
						if(self._isFocus(dayCount)) {		
							if(!self._isToday(dayCount))
							{$($this[0]).addClass(self.focusStyleName);}
							checkFocusWeek = true;
							if(isFocusWeek)
							{$($this[0].parentElement).addClass("dvc-calendar-focus-week");}
						}
						
						if(isSchedule)
						{
							cntAppointment = self._isAppointment(dayCount);
							if(cntAppointment > 0) {
								$this.find(".dvc-calendar-check").addClass("dvc-calendar-check-o")
																 .addClass("dvc-calendar-check-o-"+cntAppointment);								
							}
						}
						
						if(self._isToday(dayCount) && isSchedule){
							cntAppointment = self._isAppointment(dayCount);							
							if(cntAppointment > 0) {
								$this.find(".dvc-calendar-check").addClass("dvc-calendar-uncheck-o")
																 .addClass("dvc-calendar-uncheck-o-"+cntAppointment);								
							}
						}
						
						if(self._isHoliday(dayCount)){							
							$this.addClass("dvc-calendar-holiday");
						}						
						dayCount++;
					}
					else {
						$this.find(".dvc-calendar-text").text(startdate++);
						$this.addClass("dvc-calendar-x");
					}					
				});
				
			} while(weekNumber < 6);

			$el.find("tbody td .dvc-calendar-text").each(function() {
				$(this).css("top", self.text_top); 
			});
			
		},
		getEventNames: function() {
			return ["ev_click"];
		}
		
	});
})( jQuery );
