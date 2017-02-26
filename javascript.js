$(function () {


// ----------------------------------
// ----------------------------------

var score = 0;
var stage = 0;
var stageProgress = 0;
var toNextStage = [25]
for (var i=0; i<=20; i++) {
	toNextStage.push(45 + (i*10))
}

var encounterPoint = undefined;
var intermission = false;
var typingMode = false;
var enableSounds = true;
var enableVivaldi = true;

var highscore = 0;
var goodAnswers = 0;
var badAnswers = 0;
var theFurthest = 0;
var bestSpeed = 0;
var gameTime = 0;
var frags = 0;

var bonus = false;
var whereIsTheBonus = 0;

// ----------------------------------
// ----------------------------------
// Landscape

var terrainType = 0;
var grass = 50;

var tankYPosition = parseInt($('.tank').css('top'));
var foeYPosition = parseInt($('.foeTank').css('top'));
var foeXHidePosition = parseInt($('.foeTank').css('left'))
var foeXAttackPosition = foeXHidePosition - 400;
var patienceBarWidth = 200;

var stageBank = ['none', "Hyesan","Kusong","Rason","Kimch'aek","Anju","Tokch'on","Kanggye","Haeju","P'yongsong","Sunch'on","Sariwon","Kaesong","Kaech'on","Tanch'on","Sinuiju","Wonsan","Namp'o","Ch'ongjin","Hamhŭng","Pjongjang"]
// var stageBank = ['none', "Hyesan","Kusŏng","Rasŏn","Kimch'aek","Anju","Tŏkch'ŏn","Kanggye","Haeju","P'yŏngsŏng","Sunch'ŏn","Sariwŏn","Kaesŏng","Kaech'ŏn","Tanch'ŏn","Sinŭiju","Wŏnsan","Namp'o","Ch'ŏngjin","Hamhŭng","Pjongjang"]



// ----------------------------------
// ----------------------------------
// The Tank

var tank = {
	hearts: 3,
	speed: 0,
	desiredSpeed: 0,
	turbo: 1,
	brakes: false,
	metres: 0,
	odometer: 0,

	// moving

	launch: function(startedSpeed, initialSpeed) {
		if (tank.speed === 0) {
			if (initialSpeed) {
				tank.speed = initialSpeed
			} else {
				tank.speed = 6;
			}
			tank.moveForward();
			tank.setSpeed(startedSpeed)
			setTimeout(tank.shake, 50);
		}
	},

	moveForward: function () {
		// Dealing with the grass
		grass -= 5 * tank.turbo;
		if (grass <= 0) {
			// measure traveled distance
			tank.metres ++;
			tank.odometer ++;
			$('.mileage span').text((Math.floor(tank.metres/10)/100).toFixed(2))

			// reset grass and plant new one
			grass = 50;
			$('.ground:first-child').remove();
			addGrass();

			// meeting foe
			if (tank.metres >= encounterPoint) {
				encounter()
			}
		}

		$('.pathway').css('padding-left', grass)

		if (bonus === true) bonusIsApproaching();

		// Recursion if not being stopped
		if (tank.speed > 0) {
			setTimeout(tank.moveForward, 50 - tank.speed)
		} else {
			tank.brakes = false;
		}

		function bonusIsApproaching () {
			whereIsTheBonus = parseInt($('.bonus').css('left'))
			$('.bonus').css('left', whereIsTheBonus - 5 + 'px')
		}
	},

	setSpeed: function (speedToSet) {
		tank.desiredSpeed = speedToSet;
		tank.SpeedUpOrSlowDown();
	},

	SpeedUpOrSlowDown: function () {
		if (tank.speed != tank.desiredSpeed) {
			if (tank.speed > tank.desiredSpeed) {
				tank.speed *= 0.90;
				if (tank.speed <= tank.desiredSpeed || (tank.desiredSpeed === 0 && tank.speed <= 2)) {
					tank.speed = tank.desiredSpeed;
				}
			} else {
				tank.speed += 1;
				if (tank.speed >= 100) {
					tank.speed = 100;
				}
			}

			switch (Math.floor(tank.speed/10)) {
				default:
				tank.turbo = 1;
				break;
				case 6:
				tank.turbo = 1.5;
				break;
				case 7:
				tank.turbo = 2;
				break;
				case 8:
				tank.turbo = 2.5;
				break;
				case 9:
				tank.turbo = 5;
				break;
				case 10:
				tank.turbo = 10;
				break;
			}

			setTimeout(function () {
				tank.setSpeed(tank.desiredSpeed)
			}, 150);
		}
	},

	alignTheSpeedToTheStage: function () {
		tank.setSpeed(30 + (stage *3))
	},


	speedUp: function () {
		if (!tank.brakes) {
			var newSpeed = tank.speed + 3;
			if (newSpeed > 100) {
				newSpeed = 100;
			}
			tank.setSpeed(newSpeed);
		}
	},

	slowDown: function () {
		if (!tank.brakes) {
			var newSpeed = tank.speed - 10;
			if (newSpeed < 5) {
				newSpeed = 5;
			}
			tank.setSpeed(newSpeed);
		}
	},

	brake: function () {
		tank.brakes = true;
		tank.setSpeed(0);
	},

	turboAcceleration: function () {
		tank.setSpeed(100);
	},

	shake: function () {
		if (tank.speed > 3) {
			$('.tank').css("top", tankYPosition+4)
			$('.foeTank').css("top", foeYPosition-2)
			setTimeout(function () {
				$('.tank').css("top", tankYPosition)
				$('.foeTank').css("top", foeYPosition+2)
			}, 100)
			setTimeout(tank.shake, 500 - (tank.speed *3.5)) 
		} 
	},

	showRealSpeed: function () {
		gameTime ++;
		var instantaneousSpeed = tank.odometer * 3.6
		$('.odometer span').text(Math.floor(instantaneousSpeed))
		if (instantaneousSpeed > bestSpeed) {
			bestSpeed = Math.floor(instantaneousSpeed);
		}
		$('.cosmometer').text(Math.floor(tank.speed))
		tank.odometer = 0;
	},

	// fighting

	shoot: function () {
		$('.tank .cannonball').remove();
		$('.tank').append("<div class='cannonball'></div>");
		sound('shot');
		$('.tank .cannonball').animate({
	    left: "+1000px"
	  }, 500)

		if (typingMode) {
				setTimeout(function () {
					$('.tank .cannonball').remove();
					foe.looseHeart();
				}, 190);
			}
	},

	looseHeart: function () {
		$('.tankHearts .heart:nth-child(' + tank.hearts + ')').fadeOut(50, function () {
			$(this).remove()
		});
		tank.hearts --;
		if (tank.hearts === 0) {
			tank.destroyed();
		} else if (tank.hearts > 0) {
			sound('tankDamaged')
		}
	},

	getHeart: function () {
		if (tank.hearts < 12) {
			tank.hearts ++;
			$('.tankHearts').append("<div class='heart'></div>")
		}
	},

	destroyed: function (nuke) {

		tank.setSpeed(10)
		sound('tankDestroyed')
		encounterPoint = undefined;
		foe.patience = undefined;
		foe.maxPatience = undefined;
		// clearInterval(theOdometerInterval)
		$('.odometer').text('0 KM/H')
		toInfo();
		typingMode = false;
		fadingTheVivaldi();

		if (nuke) {
			tank.heart = 0;
			$('.tankHearts .heart').fadeOut(50, function () {
			$(this).remove()
			$('.tank').fadeOut('fast');
			setTimeout(gameOver, 9000)
			});
		} else {
			tank.explode()
			setTimeout(gameOver, 3000)
		}

	},

	explode: function () {
		// animation

		$('.tankZone .tank').append('<div class="explosion"></div>')
		$('.tankZone .tank').css('background', 'none')
		setTimeout(function () {
		$('.tankZone .tank .explosion').remove();
		}, 170)
	}
	
}


// --------------------------
// --------------------------
// Foes

function Foe (type, attackType, hearts, toScore, patience, repatience) {
	this.type = type;
	this.attackType = attackType
	this.hearts = hearts;
	this.toScore = toScore;
	this.patience = patience;
	this.maxPatience = patience;
	this.repatience = repatience;
	this.extraPatience = 0;

	this.impatience = function () {
		if (foe.patience > foe.maxPatience) {
		foe.patience = foe.maxPatience
		}
		if (foe.patience > 0) {
			foe.patience --;
			setTimeout(foe.impatience, 1000)
			foe.drawPatience();
			if (foe.patience <= 0) {
				foe.attack();	
			}
		}
	}

	this.drawPatience = function () {
		$('.patienceBar').html('');
		if (foe.patience != undefined) {
			var toDraw = foe.patience
			for (var i=0; i<toDraw; i++) {
				if (foe.extraPatience > 0 && i > foe.maxPatience - foe.extraPatience*2) {
					$('.patienceBar').append('<div class="patiencePill extraPill"></div>')

				} else {
					$('.patienceBar').append('<div class="patiencePill"></div>')
				}
			}
		}
	}

	this.looseHeart = function () {
		if (stage > 20) {
		foe.type = 'chairman1';
		}
		$('.foeHearts .heart:last-child').fadeOut(50, function () {
			$(this).remove();
		});
		foe.hearts --;
		if (foe.repatience > 0) {
			foe.patience += foe.repatience
			if (foe.patience > foe.maxPatience) {
				foe.patience = foe.maxPatience
			}
			foe.patienceBarBlink();
		}
	
		if (foe.hearts <= 0) {
			foe.destroyed();
		} else {
			foe.drawPatience();
			// foe.impatience();
			challenge();
			sound('foeDamaged');
		}
	}

	this.patienceBarBlink = function () {
		$('.patienceBar').css('animation', 'blinking 150ms infinite').css('-webkit-animation', 'blinking 150ms infinite')
		setTimeout (function () {
		$('.patienceBar').css('animation', 'none').css('-webkit-animation', 'none')
		}, 300)


		// $('.patiencePill').hide();
		// setTimeout(function () {
		// $('.patienceBar').show();
		// }, 60)
		// setTimeout(function () {
		// $('.patiencePill').hide();
		// }, 120)
		// setTimeout(function () {
		// $('.patiencePill').show();
		// }, 180)
	}

	this. attack = function () {
		switch (foe.attackType) {
			case "impact":
			$('.foeTank').css('left', "-1200px")
			setTimeout(function () {
				if (foe.hearts > 0) {
					foe.toScore = 0;
					tank.looseHeart();
					sound('foeImpact');
					$('.foeTank').css('left', "-286px")
					foe.destroyed();
					setTimeout(function() {
						$('.answer, .question, .foresight').text("")
					}, 200)
				}
			},200)
			break;
			// -----
			case 'shot':
			foe.patience = foe.maxPatience;
			foe.drawPatience();
			$('.foeTank .cannonball').remove();
			$('.foeTank').append("<div class='cannonball'></div>");
			sound('shot');
			$('.foeTank .cannonball').animate({
		 	   left: "-1000px"
			}, 500)

			setTimeout(function () {
				$('.foeTank .cannonball').remove();
				tank.looseHeart();
			}, 190);
			break;
			// -----
			case 'nuke':
			this.nuke();
			break;
		}
	}

	this.nuke = function () {
		if (foe.type != 'none') {
			foe.toScore = 0;
			foe.destroyed(true);
			frags --;
		}
		$('.question, .answer, .foresight').text('')
		sound('nuke')
		tank.destroyed('nuke');
			$('.container').addClass('bombed');
			setTimeout( function () {
				$('.container').animate({background: 'black'}, 400)
				$('.container').removeClass('bombed').addClass('afterbomb');
				terrainType = 2;
				plantTheGrass();
			}, 5000)

	}

	this.destroyed = function (blockNextEnemy) {
		frags ++;
		typingMode = false;
		if (foe.type == "chairman1") {
			intermission = true;
			setTimeout(victory, 2000)
		}

		// animation
		$('.foeTank').append('<div class="explosion"></div>')
		$('.foeTank').removeAttr('data-foe')
		setTimeout(function () {
		$('.foeTank').css('left', foeXHidePosition + "px")
		$('.foeTank .explosion').remove();
		}, 170)

		setTimeout(function () {
			$('.answer, .question, .foresight').text("")
			if (tank.hearts > 0 && !intermission && !blockNextEnemy) {
				nextEncounter(rand(5,20+stage))
			}
		}, 1150)
		sound('foeDestroyed')

		if (foe.toScore) {
		scored(foe.toScore, ".foeZone");
		}

		if (foe.toScore === 100) {
			stageProgress += 5;
		} else if (foe.toScore <= 500) {
			stageProgress += 7.5;
		} else {
			stageProgress += 10;
		}

		if (stageProgress >= toNextStage[stage] && tank.hearts > 0) {
			nextStage();
		}

		// Reset
		foe.toScore = 0;
		foe.patience = undefined;
		foe.maxPatience = 0;
		foe.drawPatience(0)
		$('.foeHearts').html('')
	}
}
// type, attackType, hearts, toScore, patience, repatience
var none = new Foe (undefined,undefined,0,undefined,0)

var van1 = new Foe ('van1', 'impact', 1, 100, 6, 0);
var van2 = new Foe ('van2', 'impact', 5, 500, 13, 0)
var tank1 = new Foe ('tank1', 'shot', 1, 100, 6, 0); 
var tank2 = new Foe ('tank2', 'shot', 3, 500, 7, 2);
var tank3 = new Foe ('tank3', 'shot', 5, 1000, 6, 2);
var atom1 = new Foe ('atom1', 'nuke', 2, 500, 9, 4);
var atom2 = new Foe ('atom2', 'nuke', 3, 1000,11, 3);
var missle1 = new Foe ('missle1', 'impact', 1, 200, 5, 0)
var missle2 = new Foe ('missle2', 'impact', 1, 500, 4, 0)
var hammer1 = new Foe ('hammer1', 'impact', 2, 600, 7, 2);
var cosmic1 = new Foe ('cosmic1', 'shot', 1, 300, 8, 0);
var cosmic2 = new Foe ('cosmic2', 'shot', 3, 1000, 8, 4);
var chairman1 = new Foe ('chairman1', 'shot', 10, 20000, 7, 3)


var foesTable = [
		van1, van1, van1, van1,	tank1, tank1,
		// stage1, 2
		tank1, tank2, // new - tank2
		tank1, tank2,
		// stage3, 4
		missle1, van1, // new - missle1
		missle1, van1,
		// stage5. 6
		atom1, tank2, // new - atom1
		tank1, missle1,
		// stage7, 8
		cosmic1, van1, // new - cosmic1
		cosmic1, tank1,
		// stage9, 10
		van2, missle1, // new - van2
		van2, cosmic1, 
		// stage11, 12
		hammer1, tank2, // new - hammer1
		hammer1, atom1,
		// stage13, 14
		tank3, tank2, // new - tank3
		tank3, tank1,
		// stage15, 16
		missle2, van1, // new - missle2
		missle2, hammer1,
		// stage17, 18
		van2, tank3, 
		atom2, cosmic1, // new - atom2
		// stage19,20
		cosmic2, atom2, // new - cosmic2
		cosmic2, missle2,
		]

function encounter (foeType) {
	if (tank.hearts === 0) {
		return false
	}

	typingMode = true;
	encounterPoint = undefined;
	if (foeType === undefined) {
		var foeFrom = Math.floor(stage*1.5);
		var foeTo = (stage*2) + 5
		var who = rand(foeFrom, foeTo)

		foe = clone(foesTable[who])
	} else {
		foe = clone(foeType)
	}
	
	if (bonus === "extraTime") {
		foe.extraPatience = Math.ceil(foe.patience/5)
		foe.patience += foe.extraPatience;
		foe.maxPatience = foe.patience;
	} else {
		foe.extraPatience = 0;
	}

	// foe.patience = 5000

	
	if (foe.attackType === 'nuke') {
		var endanger = 2000
		danger("!", endanger)
	} else {
		var endanger = 0;

	}

	setTimeout (function () {
		toTask();
		foe.maxPatience = foe.patience
		foe.impatience();
		foe.drawPatience();


		$('.foeTank').attr('data-foe', foe.type);
		$('.foeTank').css('left', foeXAttackPosition + "px");
		if (foe.hearts > 1) {
			for (i=0; i<foe.hearts; i++) {
				$('.foeHearts').prepend('<div class="heart"></div>')
			}
		}

		challenge()
	}, endanger)
}


var task = {
	factor: [0,0,0],
	theAnswer: undefined,
	howLongIsTheAnswer: undefined,
	theAnswerBox: undefined,
	foresight: ""
}

function challenge (restart) {
	if (restart === undefined) {

		var minNum = 1 + Math.floor(stage/3);
		var maxNum = Math.floor(4.5 + stage*1.5);

		task.factor[0] = rand(minNum, maxNum);
		task.factor[1] = rand(minNum, maxNum);

		if (task.factor[0] + task.factor[1] > maxNum * 1.6 && stage > 4) {
			task.factor[0] -= 3;
			task.factor[1] -= 3;
		}

		// Foes special tasks

		if (foe.type === 'chairman1') {
			switch(rand(0,3)) {
				case 0:
				foe.type = 'tank1';
				break;
				case 1:
				foe.type = 'missle1';
				break;
				case 2:
				foe.type = 'hammer1';
				break;
				case 3:
				foe.type = 'cosmic1';
				break;
			}
		}

		if (foe.type === "cosmic1" || foe.type === "cosmic2") {
			task.factor[0] = Math.ceil(task.factor[0]*0.25)
			task.factor[1] -= Math.ceil(task.factor[1]*0.25)
			task.factor[2] = Math.ceil(rand(minNum, maxNum)*0.3);
			for (var i=0; i<3; i++) {
				if (task.factor[i] <= 1) {
					task.factor[i] = 2
				}
			}
		} else if (foe.type === 'hammer1') {
			task.factor[0] *= rand(9,15+stage);
			task.factor[1] = 2;
		} else if (foe.type === 'missle1' || foe.type === 'missle2') {
			if (task.factor[0] > 1) {
				task.factor[0] -= 1;
			}
			task.factor[1] = task.factor[0]
		} else if (foe.type === 'van2') {
			task.factor[0] = Math.floor(task.factor[0] * 0.75)
			task.factor[1] = Math.floor(task.factor[1] * 0.75)
		}
	}

	$('.question').html(task.factor[0] + " * " + task.factor[1])
	task.theAnswer = task.factor[0] * task.factor[1];

	if (foe.type === "cosmic1" || foe.type === "cosmic2") {
		$('.question').html('<span style="font-size:0.9em">' + task.factor[0] + "<span class='break'>_</span>*<span class='break'>_</span>" + task.factor[1] + "<span class='break'>_</span>*<span class='break'>_</span>" + task.factor[2] + '</span>')
		task.theAnswer = task.factor[0] * task.factor[1] * task.factor[2];
	} else if (foe.type === 'missle1' || foe.type === 'missle2') {
		$('.question').html(task.factor[0] + '<sup>2</sup>')
	}

	
	
	task.howLongIsTheAnswer = task.theAnswer.toString().length
	task.theAnswerBox = "_"
	for (var i=1; i<task.howLongIsTheAnswer; i++) {
		task.theAnswerBox += "_"
	}

	$('.answer').text(task.theAnswerBox)

	// Foresight bonus
	if (bonus === "foresight") {
		if (restart === undefined) {
			task.foresight = ""
			var foreseenBox = rand(1, task.howLongIsTheAnswer)
			for (var i=0; i<task.howLongIsTheAnswer; i++) {
				if (i+1 != foreseenBox) {
					task.foresight += "<span>_</span>";
				} else {
					task.foresight += task.theAnswer.toString().charAt(i);
				}
			}
		}
	} else {
		task.foresight = ""
	}

	$('.foresight').html("<p>" + task.foresight + "</p>")


}




// -----------------------------
// -----------------------------
// Typing controls

function typing(key) {
	if ((key >= 48 && key <= 57) || (key >= 96 && key <= 105)) {
			if (key > 60) {
			return (key - 96);
			} else {
			return (key - 48);
			}
	} else {
		return false
	}
}

$('body').keydown(function (e) {
	if (typingMode) {
		var typedNumber = typing(e.which)
	
		if (typedNumber !== false) {
			sound('type');
			var usedSpace = task.theAnswerBox.search("_")
			task.theAnswerBox = task.theAnswerBox.substr(0,usedSpace) + typedNumber;
			for (var i = usedSpace +1; i < task.howLongIsTheAnswer; i ++) {
				task.theAnswerBox += "_";
			}

			$('.answer').text(task.theAnswerBox)

			if (usedSpace === task.howLongIsTheAnswer -1) {
				if (task.theAnswerBox == task.theAnswer) {
					goodAnswers ++;
					tank.shoot()
					if (bonus === "doubleShooter") {
						setTimeout(tank.shoot, 230)
					}
				} else {
					setTimeout(mistake, 100);

					function mistake () {
						badAnswers ++;
						typingMode = false;
						danger('Misfire!', 2000)
						sound('misfire')
						setTimeout(function () {
							challenge(true);
							typingMode = true;
							toTask();
						}, 2000)
					}
				}
			}

		} else if (e.which === 8) { // Backspace
			var digitToDelete = task.theAnswerBox.search("_") - 1;
			if (digitToDelete < 0) {
				return false;
			}
			sound('type')
			task.theAnswerBox = task.theAnswerBox.substr(0,digitToDelete)
			for (var i = digitToDelete; i < task.howLongIsTheAnswer; i ++) {
					task.theAnswerBox += "_";
				}
			$('.answer').text(task.theAnswerBox)
		}
	}
})


// ----------------------------
// ----------------------------
// The gameplay

// --------------------------------
// 1. The beginning
var instantStart = false;
var inMenu = true;

foe = clone(none)

gameInitialization();
function gameInitialization () {
	if ($.cookie('highscr')) {
		highscore = $.cookie('highscr');
		$('.highscore span').text(highscore)
	}

	if ($.cookie('theFurthest')) {
		theFurthest = $.cookie('theFurthest');
	}

	if ($.cookie('sounds') === "off") {
		switchSounds();
	}

	if ($.cookie('vivaldi') === "off") {
		switchVivaldi();
	}

	plantTheGrass();
	tank.launch(20,20)
	$('.container').removeClass('antifouc')
}

// In menu
$('body').keydown(function (e) {
	var pressedKey = typing(e.which);
	var timeoutHere = 400;
	if (inMenu && pressedKey !== false) {
		switch(pressedKey) {
			case 1:
			switchSounds();
			break;
			case 4:
			setTimeout(beginTheGame, timeoutHere)
			break;
			case 9:
			switchVivaldi();
			break;
		}
		inMenu = false;
		sound('type')
		$('.typeHere').text(pressedKey)
		setTimeout(function () {
				$('.typeHere').text('_')
				if (pressedKey != 4) inMenu = true;
			}, timeoutHere)
	}
})


function switchSounds() {
	enableSounds = !enableSounds
	if (enableSounds) {
		$('.options .sounds').removeClass('disabled')
		$('.options .sounds span').text("ON")
		$.cookie("sounds", "on", { expires : 365 });
	} else {
		$('.options .sounds').addClass('disabled');
		$('.options .sounds span').text("OFF")
		$.cookie("sounds", "off", { expires : 365 });

	}
}

function switchVivaldi() {
	enableVivaldi = !enableVivaldi
	if (enableVivaldi) {
		$('.options .vivaldi').removeClass('disabled');
		$('.options .vivaldi span').text("ON")
		$.cookie("vivaldi", "on", { expires : 365 });

	} else {
		$('.options .vivaldi').addClass('disabled')
		$('.options .vivaldi span').text("OFF")
		$.cookie("vivaldi", "off", { expires : 365 });
	}
}

function beginTheGame () {
	if (instantStart) {
		terrainType = 0;
		plantTheGrass();
		$('.mainMenu').hide();
		play()
	} else {
		$('.mainMenu').fadeOut();
		tank.speed = 40 + stage * 3;
		$('.tank').animate({left: "0"}, {duration: 4000, easing:'linear', complete:play})
	}

	function play () {
		$('.answer').text('')
		$('.question').text('')
		$('.foresight').text('')
		$('.container').removeClass('afterbomb').removeClass('bomded');
		$('.mainMenu h1, .logo').css('visibility', 'hidden');
		$('.mainMenu .gameSummary').css('display', 'flex');
		$('.gameSummary p').text('').removeClass('red')
		instantStart = true;
		gameTime = 0;
		score = 0;
		frags = 0;
		goodAnswers = 0;
		badAnswers = 0;
		stageProgress = 0;
		bestSpeed = 0;
		frags = 0;
		// starting stage
		stage = 0;
		bonus = false;
		$('.bonusInfo').text('')
		$('.bonusInfo').fadeIn('fast')

		tank.hearts = 3;
		$('.tankHearts').html('<div class="heart"></div><div class="heart"></div><div class="heart"></div>')
		$('.foeHearts').html('')
		$('.score span').text('0')
		$('.stageBoard').removeClass('hide');
		$('.stageInfo').text('').show()

		inMenu = false;
		foe = clone(none);
		$('.tank').show()
		.css('background-image', 'url("./images/TheTank.png")');
		foe.drawPatience(0)

		$('.foeTank').removeAttr('data-foe')
		$('.foeTank').css('left', foeXHidePosition + "px")
		$('.tank').css('left', '0px')
		tank.speed = 30 + stage * 3;


		setTimeout(function () {
			$('.typeHere').text('_')
			$('.begin').text('Type 2 * 2 to Retry')
			$('.dashboard, .stageInfo').removeClass('hide').css('opacity', '0').fadeTo(200, 1);
			if (enableVivaldi) document.getElementById("vivaldi").play()

			// turn on the odometer
			tank.metres = 0;
			tank.odometer = 0;
			theOdometerInterval = setInterval(tank.showRealSpeed, 1000)

			if (stage > 0) { 
			stage --;
			nextStage();
			} else {
				nextEncounter(10 + rand(0,10))
			}
		}, 1000)
	}
}


// -----------------------------
// 2. During the game

function nextStage () {
	intermission = true;
	stageProgress = 0;
	if (stage == 20) {
		return chairmanApproaches()
	}

	toInfo()

	setTimeout( function () {
	$('.stageInfo').css('left', '400px')
	}, 500)
	
	if (stage > 0 && score > 0) {
		setTimeout(stageSummary, 3000)
	} else {
		setTimeout(nextStageIntroduction, 3000)
	}

	function stageSummary () {
		bonus = false;
		$('.bonusInfo').fadeOut('fast')

		$('.foresight').hide()
		$('.info1').fadeIn('fast').html(stageBank[stage] + '<br />cleared')
		setTimeout (function () {
		$('.info1').fadeOut('fast')
		}, 3000)

		var chanceForBonus = (rand(0 + Math.floor(stage/4),12))

		if (chanceForBonus < 5) {
			setTimeout(nextStageIntroduction, 5000)
		} else {
			if ((chanceForBonus === 8 || chanceForBonus === 9) && tank.hearts === 5) {
				chanceForBonus = rand(10,12);
			}
			setTimeout(collectingBonus, 2000)
		}

		function collectingBonus () {
			switch (chanceForBonus) {
				case 5:
				case 6:
				case 7:
				var newBonus = 'extraScore';
				var message = "<br />Extra Score"
				var smallInfo = "";
				break;
				case 8:
				case 9:
				var newBonus = 'extraLife';
				var message = "<br />Extra Life"
				var smallInfo = "";
				break;
				case 10:
				var newBonus = 'extraTime';
				var message = 'One-Stage<br />Extra Time<br />Bonus';
				var smallInfo = "Extra Time";
				break;
				default:
				case 11:
				var newBonus = 'foresight';
				var message = 'One-Stage<br />Foresight<br />Bonus';
				var smallInfo = "Foresight";
				break;
				case 12:
				var newBonus = 'doubleShooter';
				var message = 'One-Stage<br />Double Shooter<br />Bonus';
				var smallInfo = "Double Shooter";
				break;

			}
			$('.bonus').show().css('left', '1400px').attr('data-bonus', newBonus)
			
			bonus = true;
			tank.setSpeed(30);
			// setTimeout

			waitingForBonus = setInterval(function () {
				if (whereIsTheBonus <= 220) {
					clearInterval(waitingForBonus);
					gotIt();
				}
			}, 50)

			function gotIt() {
				sound('bonus')
				$('.bonusInfo').text(smallInfo)
				$('.bonusInfo').fadeIn('fast')
				$('.bonus').fadeOut(30)
				setTimeout(function () {
					tank.alignTheSpeedToTheStage()
				}, 1500)
				$('.info1').fadeIn('fast').html(message).addClass('bonusInfo')
				setTimeout(function () {
					$('.info1').fadeOut('fast')
				}, 2500)
				setTimeout(nextStageIntroduction, 4000);
				bonus = newBonus;
				switch (bonus) {
					case 'extraScore':
					setTimeout( function () {
						scored(1000 + stage * 250, '.tankZone');
					}, 40);
					break;
					case 'extraLife':
					tank.getHeart();
					break;
					case 'extraTime':
					$('.navigationBoard').addClass('extraTime')
					break;
					case 'foresight':
					$('.foresight').show().text()
					break;
				}
			}
		}
	}

	function nextStageIntroduction () {
		stage ++;
		if (stage >= 20) {
			terrainType = 3;
		}
		tank.alignTheSpeedToTheStage();
		$('.info1').removeClass('bonusInfo').fadeIn("fast").text('Stage ' + stage + '.')
		$('.info2').fadeIn("fast").text(stageBank[stage])


		setTimeout(stageStarted, 3000)

		function stageStarted () {
			intermission = false;
			$('.info1, .info2').fadeOut("fast")
			nextEncounter(rand(5,25))
			$('.stageInfo').text('Stage ' + stage + ". " + stageBank[stage])
			$('.stageInfo').css('left', '0px')	
		}

	}
}

// -----------------------------
// 3. End of the game

function gameOver () {
	inMenu = true;
	encounterPoint = undefined;
	$('.mainMenu').fadeIn()
	$('.dashboard, .stageBoard').addClass('hide');

	console.log('Playing time: ' + Math.floor(gameTime/ 60)  + ' min ' + gameTime%60 + ' s')
	var allAnswers = goodAnswers + badAnswers
	var accuracy = goodAnswers/allAnswers
	accuracy *= 1000
	accuracy = Math.floor(accuracy)/10
	if (!allAnswers) {
		accuracy = 0;
	}
	if (stage > 20) {
		stage = 20;
	}
	var sumParNo = 0;
	var sumPar = function () {
		return $('.gameSummary p:nth-child( ' + ++sumParNo + ')')
	}

	sumPar().html("Score: <span>" + score + "</span>")
	if (score > highscore) {
		highscore = score;
		$.cookie('highscr', highscore, { expires : 1000 });
		$('.highscore span').text(highscore)
		sumPar().html("<span class='red'>New highscore!</span>")
	}
	sumPar().html("Multiplying accuracy: <span>" + accuracy + "%</span>")
	if (stage >= 3) {
		if (accuracy === 100) {
			sumPar().html("<span class='red'>Excellent!</span>")
		} else if (accuracy >= 99) {
			sumPar().html("<span class='red'>Almost perfect!</span>")
		} else if (accuracy >= 97) {
			sumPar().html("<span class='red'>Very good!</span>")
		} else if (accuracy >= 95) {
			sumPar().html("<span class='red'>Nice!</span>")
		}
	}
	sumPar().html("Enemies defeated: <span>" + frags + "</span>")
	sumPar().html("Stage reached: <span>" + stageBank[stage] + "</span>")

	if (stage > theFurthest) {
		theFurthest = stage;
		$.cookie("theFurthest", theFurthest, { expires : 1000 });
		sumPar().html("<span class='red'>The furthest so far!</span>")
	}

	sumPar().html("Distance traveled: <span>" + tank.metres/1000 + ' km</span>')

	sumPar().html("Max speed reached: <span>" + bestSpeed + ' km/h</span>')

}


function chairmanApproaches () {
	setTimeout (function () {
		stage +=3;
		fadingTheVivaldi ()
	}, 3000)
	setTimeout( function () {
		tank.brake();
	}, 8000)
	setTimeout( function () {
		intermission = false;
		encounter(chairman1)
	}, 15000)
}

function victory() {
	if (enableSounds || enableVivaldi) {
		var theTimeout = 12000;
		document.getElementById("win").play()
	} else {
		var theTimeout = 7000;
	}
	encounterPoint = undefined;
	toInfo()
	$('.info1').text('Victory!').addClass('win')
	$('.begin').text('Type 2 * 2 to Begin')

	setTimeout(function () {
		gameOver()
		tank.launch(50)
		setTimeout(function () {
			toTask();
			$('info1').removeClass('win');
		}, 100)
	}, theTimeout)
	
}




// ----------------------------
// ----------------------------
// Supporting functions



function nextEncounter(distance) {
	encounterPoint = tank.metres + distance;
}

function scored (points, where) {
		score += points;
		$(where).append('<p class="scored">+ ' + points + '</p>');
		$('.score span').text(score)
		// $('.scored').fadeTo('slow', 0.6).animate({bottom: "+250px"}, {duration:1400, queue:false})
		setTimeout(function () {
			$('.scored').fadeOut(100)
			setTimeout(function () {
				$('.scored').remove()
				}, 100)
		}, 1100)
	}

function plantTheGrass () {
	$('.pathway').html('');
	for (var i=0; i<21; i++) {
		addGrass();
	}
}

function addGrass () {
	var grassPng
	switch(terrainType) {
		case 0:
		grassPng = rand(1,5)
		break;
		case 2:
		grassPng = rand(1,4);
		break;
		case 3:
		grassPng = "X";
		break;
	}
	var typeOfGrass =  "url('images/grass/ground" + grassPng + ".png')"
		
	$('.pathway').append('<div class="ground" style="background-image:' + typeOfGrass + '"></div>')
}


function danger (state, lasting) {
	toInfo();
	$('.danger').text(state);
	$('.danger').fadeIn('fast');
	setTimeout(function () {
		$('.danger').text("");
		toTask();
	}, lasting)
}


function rand (a, b) {
	return (Math.floor((Math.random() * (b - a +1)) + a))
};

function clone(obj){
	var tt = {};
	for (var i in obj)
		tt[i] = obj[i];
	return tt;
}

function toTask () {
	$('.infoBoard').hide();
	$('.taskBoard').show();
}

function toInfo () {
	$('.infoBoard').show();
	$('.taskBoard').hide();
}
function sound (soundName) {
	if (enableSounds) {
		var theSound = document.getElementById(soundName)
		theSound.currentTime = 0;
		theSound.play();
	}
}

function fadingTheVivaldi () {
	var vivaldisSummer = document.getElementById("vivaldi")
	var theVolume = vivaldisSummer.volume
	if (theVolume >= 0.1) {
		setTimeout( function () {
			vivaldisSummer.volume -= 0.1;
			fadingTheVivaldi();
		}, 500)
	} else {
			vivaldisSummer.pause();
			vivaldisSummer.currentTime = 0;
			vivaldisSummer.volume = 1;
	}
}

function printFoesFullRaport () {
	function possiblesFoes  () {
		var possiblesArr = []
		var smallestPossible = Math.floor(stage*1.5);
		var largestPossible = (stage*2) +5;
		for (var i = smallestPossible; i<=largestPossible; i++) {
			possiblesArr.push(foesTable[i].type)
		}
		console.log('Stage ' + stage + ': ' + possiblesArr.sort())
	}
	var rememberedStage = stage;
	for (var i=0; i<=20; i++) {
		stage = i
		possiblesFoes()
	}
	stage = rememberedStage;
}

// Prevent backspace from getting player back in browser
$(document).unbind('keydown').bind('keydown', function (event) {
    var doPrevent = false;
    if (event.keyCode === 8) {
        var d = event.srcElement || event.target;
        if ((d.tagName.toUpperCase() === 'INPUT' && 
             (
                 d.type.toUpperCase() === 'TEXT' ||
                 d.type.toUpperCase() === 'PASSWORD' || 
                 d.type.toUpperCase() === 'FILE' || 
                 d.type.toUpperCase() === 'SEARCH' || 
                 d.type.toUpperCase() === 'EMAIL' || 
                 d.type.toUpperCase() === 'NUMBER' || 
                 d.type.toUpperCase() === 'DATE' )
             ) || 
             d.tagName.toUpperCase() === 'TEXTAREA') {
            doPrevent = d.readOnly || d.disabled;
        }
        else {
            doPrevent = true;
        }
    }

    if (doPrevent) {
        event.preventDefault();
    }
});
// printFoesFullRaport();

})

/*! jquery.cookie v1.4.1 | MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?a(require("jquery")):a(jQuery)}(function(a){function b(a){return h.raw?a:encodeURIComponent(a)}function c(a){return h.raw?a:decodeURIComponent(a)}function d(a){return b(h.json?JSON.stringify(a):String(a))}function e(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return a=decodeURIComponent(a.replace(g," ")),h.json?JSON.parse(a):a}catch(b){}}function f(b,c){var d=h.raw?b:e(b);return a.isFunction(c)?c(d):d}var g=/\+/g,h=a.cookie=function(e,g,i){if(void 0!==g&&!a.isFunction(g)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setTime(+k+864e5*j)}return document.cookie=[b(e),"=",d(g),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=e?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=c(p.shift()),r=p.join("=");if(e&&e===q){l=f(r,g);break}e||void 0===(r=f(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}});