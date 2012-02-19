/**
 * jQuery simon game
 * Copyright (c) 2012, Jorge Mayo Martín
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * Date: 01/02/2012
 *
 * @author Jorge Mayo Martín
 * @version 1.0
 *
 **/
(function ($) {

	var simon = {
			DEBUG_ENABLED : true,
			debug: function (msg) {
				if (this.DEBUG_ENABLED) {
					console.log(this, msg);
				}
			},
			playButtonSound: function (buttonStr) {
				this.debug("You must implement playButtonSound function!");
			},
			playErrorSound: function () {
				this.debug("You must implement playErrorSound function!");
			}
	};

	window.simon = simon;
	
	$.fn.simon = function(options) {
		// Create some defaults, extending them with any options that were provided
		simon = $.extend( simon, options);

		//Inner costants
		var _DEBUG = simon.DEBUG_ENABLED;
		var _REC = 0;
		var _CURR = 0;
		var _ALL_STILL_CORRECT = true;
		var buttonId = 0;
		var _SEQUENCE = [];
		var _buttonDecode = ["ul","ur","dl","dr"];
		var _IS_GAME_RUNNING = false;
		var _LAST_RECORD = 0;

		//Delay values
		var _FIRST_PLAY_SQUENCE_DELAY = 2500;
		var _BETWEEN_BUTTON_DELAY = 850;
		var _SHOW_THE_BUTTON_BEGIN_DELAY = 400;
		var _SHOW_THE_BUTTON_END_DELAY = 400;

		function _show_status_msg( msg ){
			$(".simon-game #game-status")
			.removeClass("info")
			.removeClass("error")
			.removeClass("success")
			.addClass("notice").html(msg);
		}

		function _show_info_msg( msg ){
			$(".simon-game #game-status")
			.removeClass("notice")
			.removeClass("error")
			.removeClass("success")
			.addClass("info").html(msg);
		}
		function _show_error_msg( msg ){
			$(".simon-game #game-status")
			.removeClass("notice")
			.removeClass("info")
			.removeClass("success")
			.addClass("error").html(msg);
		}
		function _show_success_msg( msg ){
			$(".simon-game #game-status")
			.removeClass("error")
			.removeClass("info")
			.removeClass("notice")
			.addClass("success").html(msg);
		}

		function reset(){
			if (_LAST_RECORD < _REC){ 
				_LAST_RECORD = _REC;
			}
			_show_info_msg("HIGHSCORE "+_LAST_RECORD+" HITS!");
			_REC = 0;
			_CURR = 0;
			buttonId = 0;
			_SEQUENCE = [];
			_ALL_STILL_CORRECT = true;
			_IS_GAME_RUNNING = false;
		}

		function save_next_random(next_rec) {
			simon.debug("save_next_random() called ...");
			simon.debug("next_rec="+next_rec);
			_SEQUENCE[next_rec] = Math.floor( Math.random() * 4 );
			simon.debug("_SEQUENCE[next_rec]="+_SEQUENCE[next_rec]);
		}

		function show_complete_seq(sequence) {
			var len = sequence.length;
			//colorDecode = ["green","red","yellow","blue"];
			var strButton;
			var strButtonArr = [];

			simon.debug("show_complete_sequence(sequence) running... "
					+"[sequence]"+sequence
					+"[len]"+len);

			//Añado un primer delay a la cola (per evitar de iniciar demasiado pronto)
			$(".simon-game #play").delay( _FIRST_PLAY_SQUENCE_DELAY , "showQ" );

			$(".simon-game #play").queue(
					"showQ",
					function(next)
					{	
						_show_status_msg("LOOK THE SEQUENCE...");
						simon.debug("[show_complete_seq]inner queue ..."
								+"primer delay a la cola (per evitar de iniciar demasiado pronto)");
						next();
					}
			);

			for(var count = 0; count < len; count++) {
				strButton=_buttonDecode[sequence[count]];
				strButtonArr.push(strButton);
				simon.debug("[show_complete_seq]inner loop _RECcount]"+count
						+"[strButton]"+strButton);
				$(".simon-game #play").queue(
						"showQ",
						function(next)
						{	
							var clr = strButtonArr.pop();
							simon.debug("[show_complete_seq]inner queue ..."
									+"[this]"+this
									+"[count]"+count
									+"[clr]"+clr);
							show_the_button(clr);
							next();
						}
				);
				$(".simon-game #play").delay( _BETWEEN_BUTTON_DELAY, "showQ" );
			}
			//start the showQ
			simon.debug("[show_complete_seq] starting the 'showQ' queue ...");
			strButtonArr.reverse();
			$(".simon-game #play").queue(
					"showQ",
					function(next)
					{	
						_show_status_msg("YOUR TURN...");
						next();
					}
			);
			$(".simon-game #play").dequeue( "showQ" );//(?)
		}

		function checkCorrectButton( buttonPressed ){
			simon.debug("[checkCorrectButton] init..."
					+"[buttonPressed]"+buttonPressed
					+"[_SEQUENCE]"+_SEQUENCE
					+"[_CURR]"+_CURR
					+"[_IS_GAME_RUNNING?]"+_IS_GAME_RUNNING);

			if (!_IS_GAME_RUNNING) { 
				return false; 
			}

			if (buttonPressed == _buttonDecode[_SEQUENCE[_CURR]]){
				simon.debug("[checkCorrectButton] '"+buttonPressed+"' is correct!");
				_ALL_STILL_CORRECT = true;
			} else {
				simon.debug("[checkCorrectButton] '"+buttonPressed+"' is NOT correct!");
				_ALL_STILL_CORRECT =  false;
			}

			if (_ALL_STILL_CORRECT){
				if (_CURR == _REC) {
					simon.debug("[checkCorrectButton] _CURR == _REC; save_next_random + show_complete_seq...");
					save_next_random(_REC+=1);
					_show_success_msg("Good memory! go to the next level: "+(_REC+1)+" Hits!");
					_CURR = 0;
					show_complete_seq(_SEQUENCE);
				} else {
					if (_DEBUG) {
						console.log("[checkCorrectButton] _CURR=_CURR+1; continue waiting correct sequence...");
					}
					_CURR=_CURR+1;
				}
			} else {
				simon.playErrorSound();
				alert("WRONG HIT!: Your record was: "+_REC+" hits");
				reset();// ?
			}

		}

		$('.simon-game #play').bind('click',function(){
			simon.debug('play button Clicked!');
			reset();
			_IS_GAME_RUNNING = true;
			save_next_random(_REC);
			_show_status_msg("OK, Let's Play...");
			show_complete_seq(_SEQUENCE);
		});

		$('.simon-game #reset').bind('click',function(){
			simon.debug('reset button Clicked!');
			reset();
		});

		var strongGreenHxCode = '#00ff00';// red: 0, green: 255, blue: 0
		var softGreenHxCode =  '#00af00';// red: 0, green: 175, blue: 0

		var strongRedHxCode = '#ff0000'; // red: 255, green: 0, blue: 0
		var softRedHxCode = '#af0000'; // red: 175, green: 0, blue: 0

		var strongYellowHxCode = '#ffff00'; // red: 255, green: 255, blue: 0
		var softYellowHxCode = '#afaf00'; // red: 175, green: 175, blue: 0

		var strongBlueHxCode = '#0000ff'; // red: 0, green: 0, blue: 255
		var softBlueHxCode = '#0000af'; // red: 0, green: 0, blue: 175

		function show_the_button(strButton){
			var obj = ".simon-game #"+strButton+"-button";
			var tableButtons = {
					"ul": [strongGreenHxCode, softGreenHxCode],
					"ur": [strongRedHxCode, softRedHxCode],
					"dl": [strongYellowHxCode, softYellowHxCode],
					"dr": [strongBlueHxCode, softBlueHxCode]
			};

			simon.debug('show_the_button running... [obj]'+obj+', [strButton]'+strButton);
			simon.debug('show_the_button running... [tableButtons[strButton]]'+tableButtons[strButton]);

			$("#"+strButton+"-button")
			.queue("showQB", function (next){
				// set with strong green
				$("#"+strButton+"-button").css('background-color', tableButtons[strButton][0]);
				next();
			});

			$("#"+strButton+"-button").delay(_SHOW_THE_BUTTON_BEGIN_DELAY, "showQB");

			simon.playButtonSound(strButton);

			$("#"+strButton+"-button")
			.queue("showQB", function (next){
				// set with soft color
				$("#"+strButton+"-button").css('background-color', tableButtons[strButton][1]);
				next();
			});
			$("#"+strButton+"-button").delay(_SHOW_THE_BUTTON_END_DELAY, "showQB");//prueba

			$("#"+strButton+"-button").dequeue( "showQB" );

		}

		//
		// Register events
		//
		$('.simon-game #ul-button').bind('click',function(){
			simon.debug('ul button Clicked!');
			show_the_button("ul");
			checkCorrectButton("ul");

		});
		$('.simon-game #ur-button').bind('click',function(){
			simon.debug('ur button Clicked!');
			show_the_button("ur");
			checkCorrectButton("ur");

		});
		$('.simon-game #dl-button').bind('click',function(){
			simon.debug('dl button Clicked!');       	
			show_the_button("dl");       	
			checkCorrectButton("dl");
		});
		$('.simon-game #dr-button').bind('click',function(){
			simon.debug('dr button Clicked!');
			show_the_button("dr");
			checkCorrectButton("dr");            
		});

	}

})(jQuery);
