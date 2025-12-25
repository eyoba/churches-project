var AMETE_FEDA = new Number(5500);
	var NIUS_KEMER = 19;
	var TINTE_ABEKTE = 11;
	var TINTE_METIKEA = 19;
	WENGELAWI = [ "ዘመነ ዩሐንስ ወንጌላዊ", "ዘመነ ማቴዎስ ወንጌላዊ", "ዘመነ ማርቆስ ወንጌላዊ", "ዘመነ ሉቃስ ወንጌላዊ" ];
	// The following characters represents Amharic equivalents of the seven days.
	ELET = [ "ሰኑይ", "ሰሉስ", "ረቡዕ", "ሓሙስ", "ዓርቢ", "ቀዳም", "ሰንበት" ];
	ELET_ENGLISH = [ "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat.", "Sun." ];
	ELET_TEWSAK = [ 6, 5, 4, 3, 2, 8, 7 ]
	WOR_Eng = [ "Meskerem", "Tikimti", "Hidar", "Tahisas", "Tiri", "Yekatit", "Megabit", "Miyaziya", "Ginbot", "Sene", "Hamle", "Nehassie", "Pagumen" ];
	WOR = [ "መስከረም", "ጥቅምቲ", "ሕዳር", "ታሕሳስ", "ጥሪ", "ለካቲት", "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰነ", "ሓምለ", "ነሓሰ", "ጳግሜን" ];
	BEALAT_ASWAMAT_Eng = [ "Kidus Yohannes", "Meskel", "Lidet", "Timket", "Tsome Nenewe", "Abiy Tsome", "Debre Zeit",
					  "Hosaena", "Seklet", "Tinsae", "Rekebe Kahinat", "Erget","Peraklitos","Tsome Hawariat", "Tsome Dihnet",
					  "Tsome Filseta", "Debre Tabor", "Ye Emebetachin Erget"];
	
	BEALAT_ASWAMAT = ["ቅዱስ ዩሐንስ", "መስቀል", "ልደት", "ጥምቀት", "ጾመ ነነዌ", "ዓብይ ጾም", "ደብረ ዘይት",
					  "ሆሳዕና", "ስቅለት", "ትንሳኤ", "ርክበ ካህናት", "ዕርገት","ጴራቅሊጦስ","ጾመ ሓዋርያት", "ጾመ ድህነት",
					  "ጾመ ፍልሰታ", "ደብረ ታቦር", "ናይ ቅ.ድ ዕርገት"];

	TODAY = "ሎሚ";
	TODAY_Eng = "Today";
	
	function createCookie(name,value,days) 
	{
		// alert(name + "," + value + "," + days);
		if (days>=1) 
		{
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name + "=" + value + expires + "; path=/";
	}
	

	function readCookie(name) 
	{
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		// alert(ca);
		for(var i=0;i < ca.length;i++) 
		{
			var c = ca[i];
			// alert(ca[i]);
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length,c.length));
		}
		return null;
	}


	function blinkIt() 
	{
		if (!document.all) 
			return;
		else 
		{
			for(i=0;i<document.all.tags('blink').length;i++)
			{
				s=document.all.tags('blink')[i];
				s.style.visibility=(s.style.visibility=='visible')?'hidden':'visible';
			}
		}
	}
	
	// Create cookie to store current date

	

	//Ethiopian Millenium Countdown
	function Eth2000()
	{
		today=new Date()
		var Eth2000=new Date(today.getFullYear(), 8, 12) //Month is 0-11 in JavaScript
		if (today.getMonth()==9 && today.getDate()>12) //if Eth New Year has passed
		Eth2000.setFullYear(Eth2000.getFullYear()+1) //calculate next year's New Year
		//Set 1 day in milliseconds
		var one_day=1000*60*60*24

		//Calculate difference btw the two dates, and convert to days
		var str = "<font color='#339900' size='4'>" + Math.ceil((Eth2000.getTime()-today.getTime())/(one_day))+ " days left for the next New Year <BR></font>"
		return str;
	}

	function ameteAlem ( year ) {
		var ameteMeheret = new Number(year);
		return ameteMeheret + AMETE_FEDA;
	}
	
	function wengelawi ( year ) {
		return ( ameteAlem( year ) % 4 );
	}
	
	function tinteKemerElet ( year ) {
		var meteneRabeit =  Math.floor( ameteAlem( year ) / 4 );
		return ( (meteneRabeit + ameteAlem( year ) ) % 7 );
	}
	
	function tinteKemerKen () {
		return 1;
	}
	
	function tinteKemerWor() {
		return 0;
	}
	
	function medeb ( year ) {
		return ameteAlem( year )% NIUS_KEMER;
	}
	
	function wenber ( year ) {
		return ( medeb( year ) - 1 );
	}
	
	function abekte ( year ) {
		return ( ( wenber(year) * TINTE_ABEKTE ) % 30 );
	}
	
	function bealeMetikeaKen ( year ) {
		return 30 - abekte( year );
	}
	
	function bealeMetikeaWor ( year ) {
		if ( bealeMetikeaKen( year ) > 14 )
			return 0;
		else if (bealeMetikeaKen( year ) < 14 )
			return 1;
		else
			alert ("Error in beale metikea wor ");
	}
	
	function bealeMetikeaElet ( year ) {
		var days = bealeMetikeaWor( year ) * 30 + bealeMetikeaKen( year );
		var elet = ( tinteKemerElet( year ) - 1 + days ) % 7;
		return elet;
	}
					
	function daysEskeMebajaHamer ( year ) {
		var daysEskeMetkea =  bealeMetikeaWor( year ) * 30 + bealeMetikeaKen( year );
		var daysMetkeaEskeNenewe = 120 + ELET_TEWSAK [ bealeMetikeaElet( year ) ];
		var days = daysEskeMetkea + daysMetkeaEskeNenewe;
		return days;
	}
	
	function mebajaHamerKen ( year ) {
		var ken = ( bealeMetikeaKen( year ) + ELET_TEWSAK [ bealeMetikeaElet( year ) ] ) % 30;
		if (ken == 0 )
			ken = 30;
		return ken;
	}
	
	function mebajaHamerWor ( year ) {
		var wor = Math.floor(daysEskeMebajaHamer( year ) / 30);
		if ( (daysEskeMebajaHamer( year ) % 30) == 0)
			wor--;
		return wor;
	}
//......................... Yebealat kenat ena worat / functions that return days and months of feasts		
	function neneweKen ( year ) {
		return mebajaHamerKen( year );
	}
	
	function neneweWor ( year ) {
		return mebajaHamerWor( year );
	}

	function abiyTsomeKen( year ) {
		var ken = (daysEskeMebajaHamer( year ) + 14 ) % 30;
		if ( ken == 0)
			ken = 30;
		return ken;
	}
	
	function abiyTsomeWor ( year ) {
		var wor =Math.floor((daysEskeMebajaHamer( year ) + 14 ) / 30);
		if ( ((daysEskeMebajaHamer( year ) + 14 ) % 30) == 0 )
			wor--;
		return wor;
	}
		
	function debreZeitKen ( year ) {
		var ken = (daysEskeMebajaHamer( year ) + 41 ) % 30;
		if ( ken == 0)
			ken = 30;
		return ken;
	}
	
	function debreZeitWor ( year ) {
		var wor =Math.floor((daysEskeMebajaHamer( year ) + 41 ) / 30);
		if ( ((daysEskeMebajaHamer( year ) + 41 ) % 30) == 0 )
			wor--;
		return wor;	
	}
	
	function hosaenaKen ( year ) {
		var ken = (daysEskeMebajaHamer( year ) + 62 ) % 30;
		if ( ken == 0)
			ken = 30;
		return ken;
	}
	
	function hosaenaWor ( year ) {
		var wor =Math.floor((daysEskeMebajaHamer( year ) + 62 ) / 30);
		if ( ((daysEskeMebajaHamer( year ) + 62 ) % 30) == 0 )
			wor--;
		return wor;
	}
	
	function sikletKen ( year ) {
		var ken = (daysEskeMebajaHamer( year ) + 67 ) % 30;
		if ( ken == 0)
			ken = 30;
		return ken;
	}
	
	function sikletWor ( year ) {
		var wor =Math.floor((daysEskeMebajaHamer( year ) + 67 ) / 30);
		if ( ((daysEskeMebajaHamer( year ) + 67 ) % 30) == 0 )
			wor--;
		return wor;
	}
	
	function tinsaeKen ( year ) {
		var ken = (daysEskeMebajaHamer( year ) + 69 ) % 30;
		if ( ken == 0)
			ken = 30;
		return ken;
	}
	
	function tinsaeWor ( year ) {
		var wor =Math.floor((daysEskeMebajaHamer( year ) + 69 ) / 30);
		if ( ((daysEskeMebajaHamer( year ) + 69 ) % 30) == 0 )
			wor--;
		return wor;
	}
	
	function rekebeKahinatKen ( year ) {
		var ken = (daysEskeMebajaHamer( year ) + 93 ) % 30;
		if ( ken == 0)
			ken = 30;
		return ken;
	}
	
	function rekebeKahinatWor ( year ) {
		var wor =Math.floor((daysEskeMebajaHamer( year ) + 93 ) / 30);
		if ( ((daysEskeMebajaHamer( year ) + 93 ) % 30) == 0 )
			wor--;
		return wor;
	}
	
	function ergetKen ( year ) {
		var ken = (daysEskeMebajaHamer( year ) + 108 ) % 30;
		if ( ken == 0)
			ken = 30;
		return ken;
	}
	
	function ergetWor ( year ) {
		var wor =Math.floor((daysEskeMebajaHamer( year ) + 108 ) / 30);
		if ( ((daysEskeMebajaHamer( year ) + 108 ) % 30) == 0 )
			wor--;
		return wor;	
	}
	
	function peraklitosKen ( year ) {
		var ken = (daysEskeMebajaHamer( year ) + 118 ) % 30;
		if ( ken == 0)
			ken = 30;
		return ken;	
	}
	
	function peraklitosWor ( year ) {
		var wor =Math.floor((daysEskeMebajaHamer( year ) + 118 ) / 30);
		if ( ((daysEskeMebajaHamer( year ) + 118 ) % 30) == 0 )
			wor--;
		return wor;	
	}
	
	function tsomeHawariatKen ( year ) {
		var ken = (daysEskeMebajaHamer( year ) + 119 ) % 30;
		if ( ken == 0)
			ken = 30;
		return ken;	
	}
	
	function tsomeHawariatWor ( year ) {
		var wor =Math.floor((daysEskeMebajaHamer( year ) + 119 ) / 30);
		if ( ((daysEskeMebajaHamer( year ) + 119 ) % 30) == 0 )
			wor--;
		return wor;	
	}
	
	function tsomeDihenetKen ( year ) {
		var ken = (daysEskeMebajaHamer( year ) + 121 ) % 30;
		if ( ken == 0)
			ken = 30;
		return ken;	
	}
	
	function tsomeDihenetWor ( year ) {
		var wor =Math.floor((daysEskeMebajaHamer( year ) + 121 ) / 30);
		if ( ((daysEskeMebajaHamer( year ) + 121 ) % 30) == 0 )
			wor--;
		return wor;	
	}
//............................. kenachew yemaylewet bealat/ feasts with fixed dates ...................

	function enqutatashKen ( year ) {
		return 1;	
	}
	
	function enqutatashWor ( year ) {
		return 0;	
	}
	
	function meskelKen ( year ) {
		return 17;	
	}
	
	function meskelWor ( year ) {
		return 0;	
	}
	
	function genaKen ( year ) {
		var ken = 29;
		if ( (ameteAlem( year - 1 ) % 4) == 3 ) 
			ken = 28;
		
		return ken;	
	}
	
	function genaWor ( year ) {
		return 3;	
	}
	
	function timketKen ( year ) {
		return 11;	
	}
	
	function timketWor ( year ) {
		return 4;	
	}
	
	function tsomeFilsetaKen ( year ) {
		return 1;	
	}
	
	function tsomeFilsetaWor ( year ) {
		return 11;	
	}
	
	function filsetaKen ( year ) {
		return 16;	
	}
	
	function filsetaWor ( year ) {
		return 11;	
	}
	
	function debreTaborKen ( year ) {
		return 13;	
	}
	
	function debreTaborWor ( year ) {
		return 11;	
	}
	function GeezYearName(Num)
	{
		Num = Num.toString();
		switch (Num)
		{
			case (Num = "1991"):
			 return "፲፱፻፺፩";
			 break 
			case (Num = "1992"):
			 return "፲፱፻፺፪";
			 break 
			case (Num = "1993"):
			 return "፲፱፻፺፫";
			 break 
			case (Num = "1994"):
			 return "፲፱፻፺፬";
			 break 
			case (Num = "1995"):
			 return "፲፱፻፺፭";
			 break 
			case (Num = "1996"):
			 return "፲፱፻፺፮";
			 break 
			case (Num = "1997"):
			 return "፲፱፻፺፯";
			 break 
			case (Num = "1998"):
			 return "፲፱፻፺፰";
			 break 
			case (Num = "1999"):
			 return "፲፱፻፺፱";
			 break 
			case (Num = "2000"):
			 return "፳፻";
			 break 
			case (Num = "2001"):
			 return "፳፻፩";
			 break 
			case (Num = "2002"):
			 return "፳፻፪";
			 break 
			case (Num = "2003"):
			 return "፳፻፫";
			 break 
			case (Num = "2004"):
			 return "፳፻፬";
			 break 
			case (Num = "2005"):
			 return "፳፻፭";
			 break 
			case (Num = "2006"):
			 return "፳፻፮";
			 break 
			case (Num = "2007"):
			 return "፳፻፯";
			 break 
			case (Num = "2008"):
			 return "፳፻፰";
			 break 
			case (Num = "2009"):
			 return "፳፻፱";
			 break 
			case (Num = "2010"):
			 return "፳፻፲";
			 break 
			case (Num = "2011"):
			 return "፳፻፲፩";
			 break 
			case (Num = "2012"):
			 return "፳፻፲፪";
			 break 
			case (Num = "2013"):
			 return "፳፻፲፫";
			 break 
			case (Num = "2014"):
			 return "፳፻፲፬";
			 break 
			case (Num = "2015"):
			 return "፳፻፲፭";
			 break 
			case (Num = "2016"):
			 return "፳፻፲፮";
			 break 
			case (Num = "2017"):
			 return "፳፻፲፯";
			 break 
			case (Num = "2018"):
			 return "፳፻፲፰";
			 break 
			case (Num = "2019"):
			 return "፳፻፲፱";
			 break 
			case (Num = "2020"):
			 return "፳፻፳";
			 break 
			case (Num = "2021"):
			 return "፳፻፳፩";
			 break 
			case (Num = "2022"):
			 return "፳፻፳፪";
			 break 
			case (Num = "2023"):
			 return "፳፻፳፫";
			 break 
			case (Num = "2024"):
			 return "፳፻፳፬";
			 break 
			case (Num = "2025"):
			 return "፳፻፳፭";
			 break 
			case (Num = "2026"):
			 return "፳፻፳፮";
			 break 
			case (Num = "2027"):
			 return "፳፻፳፯";
			 break 
			case (Num = "2028"):
			 return "፳፻፳፰";
			 break 
			case (Num = "2029"):
			 return "፳፻፳፱";
			 break 
			case (Num = "2030"):
			 return "፳፻፴";
			 break 
		}
	}

	// mouse over highlights
	function roll(obj, highlightcolor, textcolor)
	{
		obj.style.backgroundColor = highlightcolor;
		obj.style.color = textcolor;
	}
	function disableAnchor(objId, disable) 
	{ 
		var obj = document.getElementById(objId); 
		if(obj != null) 
		{ 
			if(disable) 
			{ 
				var href = obj.getAttribute("href"); 
				var onclick = obj.getAttribute("onclick"); 
				//First we store previous value in a new attribute 
				if(href && href != "" && href != null) 
				{ 
					obj.setAttribute('href_bak', href); 
				} 
				if(onclick != null) 
				{ 
					obj.setAttribute('onclick_back', onclick); 
					obj.setAttribute('onclick', "void(0);"); 
				} 
				obj.removeAttribute('href'); 
				//obj.style.color="gray"; 
			} 
			else 
			{ 
				var hrefBack = obj.getAttribute("href_bak"); 
				var onclickBack = obj.getAttribute("onclick_back"); 
				if(onclickBack !=null ) 
				{ 
					obj.setAttribute('onclick', onclickBack); 
					obj.removeAttribute('onclick_back'); 
				} 
				if(hrefBack !=null ) 
				{ 
					obj.setAttribute('href', hrefBack); 
					obj.removeAttribute('href_bak'); 
					//obj.style.color="blue"; 
				} 
			} 
		} 
	}

//.....................................construct the calendar ..........................................
	function yeLidetaElet ( year, month ) {
		var days = 30 * month;
		var elet = ( tinteKemerElet( year ) + days ) % 7;
		return elet;
	}
	
	var geezNum = new Array();
	geezNum[1] = "፩"; geezNum[2] = "፪"; geezNum[3] = "፫"; geezNum[4] = "፬"; geezNum[5] = "፭"; geezNum[6] = "፮";
	geezNum[7] = "፯"; geezNum[8] = "፰"; geezNum[9] = "፱"; geezNum[10] = "፲"; geezNum[11] = "፲፩"; geezNum[12] = "፲፪";
	geezNum[13] = "፲፫"; geezNum[14] = "፲፬"; geezNum[15] = "፲፭"; geezNum[16] = "፲፮"; geezNum[17] = "፲፯";
	geezNum[18] = "፲፰"; geezNum[19] = "፲፱"; geezNum[20] = "፳"; geezNum[21] = "፳፩"; geezNum[22] = "፳፪";
	geezNum[23] = "፳፫"; geezNum[24] = "፳፬"; geezNum[25] = "፳፭"; geezNum[26] = "፳፮"; geezNum[27] = "፳፯"; geezNum[28] = "፳፰";
	geezNum[29] = "፳፱"; geezNum[30] = "፴";

	// Other National Holiodays

	var MD=new Array();
	MD[0] = new Array("3_7","ኢድ አል ፈጥር (ረመዳን)", "Id Al Fater(Remedan)");
	MD[1] = new Array("5_15","ኢል አል አድሓ (አረፋ)", "Id Al Adaha(Arafa)");
	MD[2] = new Array("7_23","መዓልቲ ሰራሕተኛታት", "International Labour Day");
	MD[3] = new Array("8_16","መዉሊድ", "Birth day of the prophet Mohammed (Maulid)");
	MD[4] = new Array("8_16","በዓል ናጽነት ኤርትራ", "Eritrea Independence day");
        MD[5] = new Array("9_13","በዓለ ሰማእታት ኤርትራ", "Eritrea martyre's  day");
	
	// function used to Highlight National Holidays

	function HighL(month, date)
	{
		var YrMn, isHoliday = false
		var Mn=month,Dt=date 
		for(j=0;j<=5;j++)
		{
			YrMn=MD[j][0].split("_");
			if(Mn==YrMn[0] && Dt==YrMn[1])
				isHoliday = MD[j][1];
		}
		return isHoliday;
	}

	function serkeMealtInAmharic( serkee )
	{ var serkeM=serkee;
	  if(serkee == 10)
	  if(serkee == 10) serkeM = "0";
	  else if(serkee > 10 && serkee < 20) serkeM = "0" + (serkee % 10);
	  else if (serkee == 20) serkeM = "!";
	  else if(serkee > 20 && serkee < 30) serkeM = "!" + (serkee % 10);
	  else if (serkee == 30) serkeM = "V";
		return serkeM;
	}
	function displayCalendar ( txtYear, txtMonth, txtDay ){
		var gregYear = new Number(txtYear);
		var gregMonth = new Number (txtMonth);
		var gregDay = new Number (txtDay);
		var month = gregToEthMonth ( gregYear, gregMonth, gregDay );
		var year = gregToEthYear ( gregYear, gregMonth, gregDay );
		var geezZareKen; 
		var strCalTable = "";
		firstTime = true;
		

		strCalTable = strCalTable + "<form name=\"frmEthiopianCalendar\"  class=\"aClassBorder\" method=\"post\" action=\"\">";
		
      	strCalTable = strCalTable + "<table width=\"41%\" border=\"0\" bgcolor='green' cellpadding=\"0\" cellspacing=\"1\" >";
    	strCalTable = strCalTable + "<tr>";
      	strCalTable = strCalTable + "<td bgcolor='white' align ='center' id = \"wengelawi\" > <font size=\"2\"  color='Sienna'>" + WENGELAWI[ wengelawi(year) ] +" </font> </td>";
      	strCalTable = strCalTable + "<td id='YeZareKen' bgcolor='white' align ='left'></td>";
		strCalTable = strCalTable + "</tr>";

		strCalTable = strCalTable + "<tr> <td bgcolor='white' >";
     	strCalTable = strCalTable + "<select name=\"lstWor\" class=\"aClassSelect\" size=\"1\" id=\"lstWor\" onChange=\"changeCalendarByMonthOrYear(frmEthiopianCalendar.lstYear.value, frmEthiopianCalendar.lstWor.value)\">";
		for (var worCount = 0; worCount < 13; worCount++)
			if ( worCount == month )
				strCalTable = strCalTable + "<option value=\""+ worCount +"\" selected>"+ WOR[ worCount ] +"</option>";
			else
				strCalTable = strCalTable + "<option value=\""+ worCount+"\">"+ WOR[ worCount ] +"</option>";
		strCalTable = strCalTable + "</select>";
      	strCalTable = strCalTable + "<select name=\"lstYear\" class=\"aClassSelect\" size=\"1\" id=\"lstYear\" onChange=\"changeCalendarByMonthOrYear(frmEthiopianCalendar.lstYear.value, frmEthiopianCalendar.lstWor.value)\">";
		for (var count = 2000; count <= 2020; count++)
			if (count == year )
				strCalTable = strCalTable + "<option value=\""+ count +"\" selected>"+ count +"</option>";
			else
				strCalTable = strCalTable + "<option value=\""+count+"\">"+ count +"</option>";
		strCalTable = strCalTable + "</select>"; 
		//Bealat zerzer
      	strCalTable = strCalTable + "<select name=\"lstBealat\" class=\"aClassSelect\" size=\"1\" id=\"lstBealat\" onChange=\"changeCalendarByBeal (frmEthiopianCalendar.lstYear.value, frmEthiopianCalendar.lstBealat.value)\">";
		strCalTable = strCalTable + "<option value=\"_0\" selected> በዓላት ወኣጽዋማት </option>";	
		for (var bealCount = 0; bealCount < 18; bealCount++ )
			strCalTable = strCalTable + "<option value=\""+bealCount+"\">"+ BEALAT_ASWAMAT[bealCount] +"</option>";
		strCalTable = strCalTable + "</select></td>";
		
		strCalTable = strCalTable + "<td bgcolor='white' id = \"gregMonthYear\" align=\"left\"><font size=\"1\">";
		if (month == 12)
			strCalTable = strCalTable + gregMonths[ethMonthToGregMonth ( year, month, 1 )] ;
		else
			strCalTable = strCalTable + gregMonths[ethMonthToGregMonth ( year, month, 1 )] + "/" + gregMonths[ethMonthToGregMonth ( year, month, 30 )];
		
		if (month == 3)
			strCalTable = strCalTable + " " + ethYearToGregYear( year, month, 1 ) + "/" + ethYearToGregYear( year, month, 30 );
		else
			strCalTable = strCalTable + " " + ethYearToGregYear( year, month, 1 ) ;
			
		strCalTable = strCalTable +" </font></td>"
		strCalTable = strCalTable + "</tr> ";
    	strCalTable = strCalTable + "</table>";
		strCalTable = strCalTable + "<table width=\"41%\" cellpadding=\"0\" cellspacing=\"1\" bgcolor='darkyellow' >";
		strCalTable = strCalTable + "<tr>";
		for (eletIndex = 0; eletIndex < 7; eletIndex++ )
			if (eletIndex == 6)
				strCalTable = strCalTable + "<td align='center' bgColor=\"#336699\" > <font  color='white' size=\"1\">" + ELET[eletIndex] + "</font><br><font  color='black' size=\"1\">" + ELET_ENGLISH[eletIndex] + "</font> </td>";
			else
				strCalTable = strCalTable + "<td align='center' bgcolor='#336699'> <font    color='white' size=\"1\">" + ELET[eletIndex] + "</font><br><font  color='black' size=\"1\">" + ELET_ENGLISH[eletIndex] + "</font></td>";
		strCalTable = strCalTable + "</tr>";
		
		var serkeMealt = 1;
		var lideta = yeLidetaElet( year, month );
		var maxDays;

		if ( (month == 12) && (wengelawi( year ) == 3) )
			maxDays = 6;
		else if ( (month == 12) && (wengelawi( year ) != 3) )
			maxDays = 5;
		else 
			maxDays = 30;
				
		var desc="";

		for ( var week = 1; week < 7; week++ ){
			strCalTable = strCalTable + "<tr height='30px'>";
			for (var dayIndex = 0; dayIndex < 7; dayIndex++ ){
				strCalTable = strCalTable + "<td onMouseover=\"roll(this, '', 'black');\""; 
				if (dayIndex == 6)
					strCalTable = strCalTable + "onMouseout=\"roll(this, '','black');\" id = \"td" + week +"_"+ dayIndex + "\" align =\"center\" bgColor='#FFFF99' ";
				else if (today.getDate() == ethDayToGregDay ( year, month, serkeMealt ))
					strCalTable = strCalTable + "onMouseout=\"roll(this, '','black');\" id = \"td" + week +"_"+ dayIndex + "\" align =\"center\" ";
				else
					strCalTable = strCalTable + "onMouseout=\"roll(this, '','black');\" id = \"td" + week +"_"+ dayIndex + "\" align =\"center\"";
				if ( ((lideta == dayIndex) && (serkeMealt <= maxDays)) || ((serkeMealt > 1) && (serkeMealt <= maxDays)) ){
					if (HighL(month, serkeMealt)){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a class=\"sundayactive\" href=\"#\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - " + HighL(month, serkeMealt) + "<br>";
					}
					else if ( month == neneweWor( year ) && serkeMealt == neneweKen( year ) ){
						
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ጾመ ነነዌ\" href=\"/ጾመ-ነነዌ/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጾመ ነነዌ<br>";
					}
					else if ( month == abiyTsomeWor( year ) && serkeMealt == abiyTsomeKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ዓብይ ጾም\" href=\"/ዓብይ-ጾም/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ዓብይ ጾም<br>";
					}
					else if ( month == debreZeitWor( year ) && serkeMealt == debreZeitKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ደብረ ዘይት\" href=\"/ደብረ-ዘይት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ደብረ ዘይት<br>";
					}
					else if ( month == hosaenaWor( year ) && serkeMealt == hosaenaKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ሆሳዕና\" href=\"/ሆሳዕና/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ሆሳዕና<br>";
					}
					else if ( month == sikletWor( year ) && serkeMealt == sikletKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ስቅለት\" href=\"/ስቅለት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ስቅለት<br>";
					}
					else if ( month == tinsaeWor( year ) && serkeMealt == tinsaeKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ትንሳኤ\" href=\"/ትንሳኤ/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ትንሳኤ<br>";
					}
					else if ( month == rekebeKahinatWor( year ) && serkeMealt == rekebeKahinatKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ርክበ ካህናት\" href=\"/ርክበ-ካህናት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ርክበ ካህናት<br>";
					}
					else if ( month == ergetWor( year ) && serkeMealt == ergetKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a  title = \"ዕርገት\" href=\"/ዕርገት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ዕርገት<br>";
					}
					else if ( month == peraklitosWor( year ) && serkeMealt == peraklitosKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ጴራቅሊጦስ\" href=\"/ጴራቅሊጦስ/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጴራቅሊጦስ<br>";
					}
					else if ( month == tsomeHawariatWor( year ) && serkeMealt == tsomeHawariatKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ጾመ ሓዋርያት\" href=\"/ጾመ-ሓዋርያት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጾመ ሓዋርያት<br>";
					}
					else if ( month == tsomeDihenetWor( year ) && serkeMealt == tsomeDihenetKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ጾመ ድህነት\" href=\"/ጾመ-ድህነት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጾመ ድህነት<br>";
					}
					else if ( month == enqutatashWor( year ) && serkeMealt == enqutatashKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ቅዱስ ዩሐንስ\" href=\"/ቅዱስ-ዩሐንስ/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ቅዱስ ዩሐንስ<br>";
					}
					else if ( month == meskelWor( year ) && serkeMealt == meskelKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"መስቀል\" href=\"/መስቀል/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font face=\"verdana\" size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						 desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - መስቀል<br>";
					}
					else if ( month == genaWor( year ) && serkeMealt == genaKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ልደት\" href=\"/ልደት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ልደት<br>";
					}
					else if ( month == timketWor( year ) && serkeMealt == timketKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ጥምቀት\" href=\"/ጥምቀት/\">" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጥምቀት<br>";
					}
					else if ( month == tsomeFilsetaWor( year ) && serkeMealt == tsomeFilsetaKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ጾመ ፍልሰታ\" href=\"/ጾመ-ፍልሰታ/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጾመ ፍልሰታ<br>";
					}
					else if ( month == filsetaWor( year ) && serkeMealt == filsetaKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ናይ ኣዴና ቅ.ድ ዕርገት\" href=\"/ናይ- ኣዴና-ዕርገት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ናይ ኣዴና ቅ.ድ ዕርገት<br>";
					}
					else if ( month == debreTaborWor( year ) && serkeMealt == debreTaborKen( year ) ){
						strCalTable = strCalTable + "bgColor=\"#FFFF00\" > <a title = \"ደብረ ታቦር\" href=\"/ደብረ-ታቦር/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ደብረ ታቦር<br>";
					}
					else if (today.getDate() == ethDayToGregDay ( year, month, serkeMealt ) ){
						strCalTable = strCalTable + "bgColor='#CFCFCF' > <a class=\"sundayactive\"  href=\"#\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>"; 
						if(firstTime)
						{
							
							var Zare = new Date();
							
							function createCookie(name,value,days) 
							{
								// alert(name + "," + value + "," + days);
								if (days>=1) 
								{
									var date = new Date();
									date.setTime(date.getTime()+(days*24*60*60*1000));
									var expires = "; expires="+date.toGMTString();
								}
								else var expires = "";
								document.cookie = name + "=" + value + expires + "; path=/";
							}
							
							createCookie('myCookie1',escape(ELET[Zare.getDay()-1]),0);
							createCookie('myCookie2',escape(WOR[month]),0);
							createCookie('myCookie3',escape(geezNum[serkeMealt]),0);
							createCookie('myCookie4',escape(GeezYearName(year)),0);

							function readCookie(name) 
							{
								var nameEQ = name + "=";
								var ca = document.cookie.split(';');
								// alert(ca);
								for(var i=0;i < ca.length;i++) 
								{
									var c = ca[i];
									// alert(ca[i]);
									while (c.charAt(0)==' ') c = c.substring(1,c.length);
									if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length,c.length));
								}
								return null;
							}
						}
					}
					else
						{strCalTable = strCalTable + "bgColor='white' >";
						if (dayIndex == 6) strCalTable = strCalTable ;
						strCalTable = strCalTable + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" ;
						if (dayIndex == 6) strCalTable = strCalTable ;
						}
					serkeMealt++;
				}
				else 
					strCalTable = strCalTable + "bgcolor=\"#FFFFFF\" > ";
				strCalTable = strCalTable + "</td>";
			}
			strCalTable = strCalTable + "</tr>";
		}
		strCalTable = strCalTable + "<tr bgcolor=\"#ffffff\">";
		if (desc == "")
			desc = "<br>";
		strCalTable = strCalTable + "<td id = \"bealGeletsa\" colspan = \"7\" align = \"left\"><font size=\"2\">" + desc + "</font>";
		strCalTable = strCalTable + "</td>";
		strCalTable = strCalTable + "</tr>";
		strCalTable = strCalTable + "</table> </form>";
		if(document.getElementById("geez-calendar-container")){document.getElementById("geez-calendar-container").innerHTML = strCalTable;}else{document.writeln(strCalTable);};

		document.frmEthiopianCalendar.lstWor.options[month].selected = true;
		document.frmEthiopianCalendar.lstYear.options[year-2000].selected = true;
		document.frmEthiopianCalendar.lstBealat.options[0].selected = true;

		if(firstTime) {
			document.getElementById('YeZareKen').innerHTML = "<font size=\"2\" color='green'><a href=\"javascript:location.reload(true);\">" + TODAY + "/Today</a> </font>";  
			//document.write("<BR><CENTER><blink>" + Eth2000() + "</blink><font size='4' color='#FF0000'>መልካም 3ኛ ሺህ-ዓመተ ዘመን!</font></CENTER>");
		}
		firstTime = false;
	}
	
//..........................manage user inputs- modifies calendar according to user input ...............
	function changeCalendarByMonthOrYear (txtYear, txtMonth){
		document.frmEthiopianCalendar.lstBealat.options[0].selected = true;
		changeCalendar (txtYear, txtMonth);
	}

	function changeCalendarByBeal (txtYear, txtMonth){
		var year = new Number (txtYear);
		
		if (txtMonth == "0" )
			txtMonth = 0; // Kidus Yohannes 
		else if (txtMonth == "1" )
			txtMonth = 0; // Meskel 
		else if (txtMonth == "2" )
			txtMonth = 3; // Ye Chiristos Lidet 
		else if (txtMonth == "3" )
			txtMonth = 4; // Timket 
		else if (txtMonth == "4" )
			txtMonth = neneweWor( year ); // Nenewe Tsome Megbia 
		else if (txtMonth == "5" )
			txtMonth = abiyTsomeWor( year ); // Abiy Tsome Megbia 
		else if (txtMonth == "6" )
			txtMonth = debreZeitWor( year ); // Debre Zeit 
		else if (txtMonth == "7" )
			txtMonth = hosaenaWor( year ); // Hosaena 
		else if (txtMonth == "8" )
			txtMonth = sikletWor( year ); // Sikelet 
		else if (txtMonth == "9" )
			txtMonth = tinsaeWor( year ); // Tinsae
		else if (txtMonth == "10" )
			txtMonth = rekebeKahinatWor( year ); // Rekebe Kahinat 
		else if (txtMonth == "11" )
			txtMonth = ergetWor( year ); // Erget 
		else if (txtMonth == "12" )
			txtMonth = peraklitosWor( year ); // Peraklitos 
		else if (txtMonth == "13" )
			txtMonth = tsomeHawariatWor( year ); // Ye Hawariat Tsome Megbia 
		else if (txtMonth == "14" )
			txtMonth = tsomeDihenetWor( year ); // Tsome Dihenet Megemeria
		else if (txtMonth == "15" )
			txtMonth = tsomeFilsetaWor( year ); // Tsome Filseta Megbia
		else if (txtMonth == "16" )
			txtMonth = debreTaborWor( year ); // Debre Tabor 
		else if (txtMonth == "17" )
			txtMonth = filsetaWor( year ); // Filseta
		else
			txtMonth = frmEthiopianCalendar.lstWor.value;
		
		document.frmEthiopianCalendar.lstWor.options[txtMonth].selected = true;
		changeCalendar (txtYear, txtMonth);
	}
	
	function changeCalendar( txtYear, txtMonth){
		var year = new Number(txtYear);
		var month = new Number (txtMonth);
		var serkeMealt = 1;
		var lideta = yeLidetaElet( year, month );
		var maxDays;

		if ( (month == 12) && (wengelawi( year ) == 3) )
			maxDays = 6;
		else if ( (month == 12) && (wengelawi( year ) != 3) )
			maxDays = 5;
		else 
			maxDays = 30;
		
		var desc="";

		document.getElementById("wengelawi").innerHTML = "<font size=\"2\"  color='Sienna'>" + WENGELAWI[ wengelawi(year) ] +" </font>";
		
		var currentMonthYear = "";
		if (month == 12 )
			currentMonthYear= currentMonthYear + gregMonths[ethMonthToGregMonth ( year, month, 1 )] ;
		else
			currentMonthYear= currentMonthYear + gregMonths[ethMonthToGregMonth ( year, month, 1 )] + "/" + gregMonths[ethMonthToGregMonth ( year, month, 30 )];

		if (month == 3)
			currentMonthYear= currentMonthYear +" " + ethYearToGregYear( year, month, 1 ) + "/" + ethYearToGregYear( year, month, 30 );
		else
			currentMonthYear= currentMonthYear + " " + ethYearToGregYear( year, month, 1 ) ;
		document.getElementById("gregMonthYear").innerHTML = "<font size=\"1\">"+ currentMonthYear + "</font>";
		
		for ( var week = 1; week < 7; week++ ){
			for ( var dayIndex = 0; dayIndex < 7; dayIndex++ ){
				if ( ((lideta == dayIndex) && (serkeMealt <= maxDays)) || ((serkeMealt > 1) && (serkeMealt <= maxDays)) ){	
					if ( HighL(month, serkeMealt)){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML = "<a class=\"sundayactive\" href=\"#\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ='#FFFF00';
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - " + HighL(month, serkeMealt) + "<br>";
					}
					else if ( month == neneweWor( year ) && serkeMealt == neneweKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ጾመ ነነዌ\" href=\"/ጾመ-ነነዌ/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጾመ ነነዌ<br>";
					}
					else if ( month == abiyTsomeWor( year ) && serkeMealt == abiyTsomeKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ዓብይ ጾም\" href=\"/ዓብይ-ጾም/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ዓብይ ጾም<br>";
					}
					else if ( month == debreZeitWor( year ) && serkeMealt == debreZeitKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ደብረ ዘይት\" href=\"/ደብረ-ዘይት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ደብረ ዘይት<br>";
					}
					else if ( month == hosaenaWor( year ) && serkeMealt == hosaenaKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ሆሳዕና\" href=\"/ሆሳዕና/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ሆሳዕና<br>";
					}
					else if ( month == sikletWor( year ) && serkeMealt == sikletKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ስቅለት\" href=\"/ስቅለት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ስቅለት<br>";
					}
					else if ( month == tinsaeWor( year ) && serkeMealt == tinsaeKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ትንሳኤ\" href=\"/ትንሳኤ/\" >" + "<font  size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ትንሳኤ<br>";
					}
					else if ( month == rekebeKahinatWor( year ) && serkeMealt == rekebeKahinatKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ርክበ ካህናት\" href=\"/ርክበ-ካህናት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ርክበ ካህናት<br>";
					}
					else if ( month == ergetWor( year ) && serkeMealt == ergetKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ዕርገት\" href=\"/ዕርገት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ዕርገት<br>";
					}
					else if ( month == peraklitosWor( year ) && serkeMealt == peraklitosKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ጴራቅሊጦስ\" href=\"/ጴራቅሊጦስ/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጴራቅሊጦስ<br>";
					}
					else if ( month == tsomeHawariatWor( year ) && serkeMealt == tsomeHawariatKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ጾመ ሓዋርያት\" href=\"/ጾመ-ሓዋርያት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጾመ ሓዋርያት<br>";
					}
					else if ( month == tsomeDihenetWor( year ) && serkeMealt == tsomeDihenetKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ጾመ ድህነት\" href=\"/ጾመ-ድህነት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጾመ ድህነት<br>";
					}
					else if ( month == enqutatashWor( year ) && serkeMealt == enqutatashKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ቅዱስ ዩሐንስ\" href=\"/ቅዱስ-ዩሐንስ/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ቅዱስ ዩሐንስ<br>";
					}
					else if ( month == meskelWor( year ) && serkeMealt == meskelKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"መስቀል\" href=\"/መስቀል/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - መስቀል<br>";
					}
					else if ( month == genaWor( year ) && serkeMealt == genaKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ልደት\" href=\"/ልደት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ልደት<br>";
					}
					else if ( month == timketWor( year ) && serkeMealt == timketKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ጥምቀት\" href=\"/ጥምቀት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጥምቀት<br>";
					}
					else if ( month == tsomeFilsetaWor( year ) && serkeMealt == tsomeFilsetaKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ጾመ ፍልሰታ\" href=\"/ጾመ-ፍልሰታ/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ጾመ ፍልሰታ<br>";
					}
					else if ( month == filsetaWor( year ) && serkeMealt == filsetaKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ናይ ኣዴና ቅ.ድ ዕርገት\" href=\"/ናይ-ኣዴና-ዕርገት/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ናይ ኣዴና ቅ.ድ ዕርገት<br>";
					}
					else if ( month == debreTaborWor( year ) && serkeMealt == debreTaborKen( year ) ){
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="<a title = \"ደብረ ታቦር\" href=\"/ደብረ-ታቦር/\" >" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF00";
						desc= desc + geezNum[serkeMealt] + "/" + ethDayToGregMonth(year, month, serkeMealt) + " - ደብረ ታቦር<br>";
					}
					else{
						/*var tempString = "";
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML =""+"<font>" + geezNum[ serkeMealt ] + "</font>"+ "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" ;
						if (dayIndex == 6) tempString = tempString + "<a  >";
						tempString = tempString + "<font>" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" ;
						if (dayIndex == 6) tempString = tempString + "</a>";
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML = tempString;
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFFFF";*/

//Surafel's modifications.... 
						
						var today = new Date();
						var gregYear = today.getFullYear();
						var gregMonth  = today.getMonth() + 1;
						var gregDay = today.getDate();
						var newMonth = gregToEthMonth ( gregYear, gregMonth, gregDay );
						var newYear = gregToEthYear ( gregYear, gregMonth, gregDay );
						
						
						var strTextToBeDisplayedInCell = "";
						//Add link to miscellaneous if the day is Sunday (i.e. dayIndex is 6) to string strTextToBeDisplayedInCell
						if ( (dayIndex == 6) && (newMonth ==month) && (newYear == year) ) strTextToBeDisplayedInCell =  "<a  >";
						
						//Add the day number (both in Greg and Eth)to string strTextToBeDisplayedInCell, irrespective of the day index
						strTextToBeDisplayedInCell = strTextToBeDisplayedInCell + "" + "<font size=\"3\">" + geezNum[ serkeMealt ] + "</font>" + "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" ;
						
						//Add closing link anchor to miscellaneous if the day is Sunday (i.e. dayIndex is 6) to string strTextToBeDisplayedInCell
						if ( (dayIndex == 6) && (newMonth ==month) && (newYear == year) ) strTextToBeDisplayedInCell = strTextToBeDisplayedInCell + "</a>";
						
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML = strTextToBeDisplayedInCell;
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFFFF";
						
//My modifications end here.					
						
/*Older version....						
						document.getElementById("td" + week +"_"+ dayIndex).innerHTML =""+"<font>" + geezNum[ serkeMealt ] + "</font>"+ "/" + "<font size=\"2\">" + ethDayToGregDay ( year, month, serkeMealt ) + "</font>" ;
						document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFFFF";
Older version ends here.
*/
					}
					serkeMealt++;
				}
				else {
					document.getElementById("td" + week +"_"+ dayIndex).innerHTML ="";
					document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFFFF";
				}

				if (dayIndex == 6)
					document.getElementById("td" + week +"_"+ dayIndex).bgColor ="#FFFF99";
			}
		}
		if (desc == "")
			desc = "<br>";
		document.getElementById("bealGeletsa").innerHTML ="<font size=\"2\">" + desc + "</font>";
		
	}
	
//........................................ Ethiopian to Gregorian .......................................
gregMonths = [ "Sep.", "Oct.", "Nov.", "Dec.", "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep." ];
gregNumDays = [ 20, 31, 30, 31, 31, 28, 31, 30, 31, 30, 31, 31, 10 ];

function isEthLeapYear ( ethYear ) {
	var ameteAlem = 5500 + ethYear;

	if ( (ameteAlem % 4) == 3 )
		return true;
	else 
		return false;
}

function isGregLeapYear ( gregYear ) {
	if (gregYear % 4 != 0)
		return false;//{use 28 for days in February}
	else if  (gregYear % 400 == 0)
		return true;//{use 29 for days in February}
	else if (gregYear % 100 == 0)
		return false;//{use 28 for days in February}
	else
		return true;//{use 29 for days in February}
}

function ethDaysFromNewYear ( ethMonth, ethDay ){
	return ( (ethMonth * 30) + ethDay ); 
}

function ethMonthToGregMonth ( ethYear, ethMonth, ethDay ){
	var gregMonthIndex = 0;
	var days = ethDaysFromNewYear ( ethMonth, ethDay );
	var dayFound = false;
	
	do{
		var daysToSubtract = gregNumDays [ gregMonthIndex ];	
		//check if the prev Eth year is leap year
		if ( gregMonthIndex == 0 ){
			if ( isEthLeapYear ( ethYear - 1 ) )
				days +=1;//daysToSubtract -= 1;
		}
		else if ( gregMonthIndex == 12 ) //check if this Eth year is leap year; if it is, days of sept 2 is = 11
			if ( isEthLeapYear ( ethYear ) )
				daysToSubtract += 1;
		//check if the this Greg year is leap year if it is, the Feb = 29
		if ( gregMonthIndex == 5 ) //If the month is February
			if ( isGregLeapYear ( ethYear + 8 ) )
				 daysToSubtract += 1;
		
		if ( days > daysToSubtract ){
			days -= daysToSubtract;
			gregMonthIndex++;
		}
		else
			dayFound = true;
	}while ( !dayFound );
	
	return gregMonthIndex;
}

function ethYearToGregYear( ethYear, ethMonth, ethDay ) {
	var gregYear = ethYear + 7;
	if ( (ethMonthToGregMonth ( ethYear, ethMonth, ethDay )) > 3 )
		gregYear +=1;
	return gregYear;
}

function ethDayToGregDay ( ethYear, ethMonth, ethDay ){
	var gregMonthIndex = 0;
	var days = ethDaysFromNewYear ( ethMonth, ethDay );
	var dayFound = false;
	
	do{
		var daysToSubtract = gregNumDays [ gregMonthIndex ];	
		//check if the prev Eth year is leap year
		if ( gregMonthIndex == 0 ){
			if ( isEthLeapYear ( ethYear - 1 ) )
				days +=1;
		}
		else if ( gregMonthIndex == 12 ) //check if this Eth year is leap year; if it is, days of sept 2 is = 12
			if ( isEthLeapYear ( ethYear ) )
				daysToSubtract += 1;
		//check if the this Greg year is leap year if it is, the Feb = 29
		if ( gregMonthIndex == 5 ) //If the month is February
			if ( isGregLeapYear ( ethYear + 8 ) )
				 daysToSubtract += 1;
		
		if ( days > daysToSubtract ){
			days -= daysToSubtract;
			gregMonthIndex++;
		}
		else
			dayFound = true;
	}while ( !dayFound );
	
	if (gregMonthIndex == 0)
		days += 10;
	
	return days;
}
nfunction ethDayToGregMonth ( ethYear, ethMonth, ethDay ){
	var gregMonthIndex = 0;
	var days = ethDaysFromNewYear ( ethMonth, ethDay );
	var dayFound = false;
	
	do{
		var daysToSubtract = gregNumDays [ gregMonthIndex ];
		if ( gregMonthIndex == 0 ){
			if ( isEthLeapYear ( ethYear - 1 ) )
				days +=1;
		}
		else if ( gregMonthIndex == 12 )
			if ( isEthLeapYear ( ethYear ) )
				daysToSubtract += 1;
		if ( gregMonthIndex == 5 )
			if ( isGregLeapYear ( ethYear + 8 ) )
				 daysToSubtract += 1;
		
		if ( days > daysToSubtract ){
			days -= daysToSubtract;
			gregMonthIndex++;
		}
		else
			dayFound = true;
	}while ( !dayFound );
	
	return gregMonthIndex + 1;
}

//.........................................Gregorian to Ethiopian........................................

function gregToEthYear ( gregYear, gregMonth, gregDay ) {
	var ethYear;
	
	if ( gregMonth > 9 )
		ethYear = gregYear - 7;
	else if (gregMonth < 9)
		ethYear = gregYear - 8;
	else {  //Gregorian month is September (9)
		ethYear  = gregYear - 8;
		if ( isEthLeapYear ( ethYear ) ) {
			if ( gregDay > 11 )
				ethYear += 1;
		}
		else
			if ( gregDay > 10 )
				ethYear += 1;
	}
	
	return ethYear;
}

function daysFromSept ( gregYear, gregMonth, gregDay ) {
	var ethYear, ethMonth;
	var i, monthIndex, days = 0;

	ethYear = gregToEthYear ( gregYear, gregMonth, gregDay );
	
	//Adjust index of the given month according to the values of gregNumDays - Ethiopian month sequence
	if ( gregMonth < 9 )
		monthIndex = gregMonth + 3;
	else if ( gregMonth > 9 )
		monthIndex = gregMonth % 9;
	else //Month = 9
		if ( gregDay > 11 )
			monthIndex = 0;
		else if ( gregDay < 11 )
			monthIndex = 12;
		else  //gregDay = 11 and month = 9
			if ( isEthLeapYear ( ethYear ) ) //if this year is leap year Sept 11 is in Pagume
				monthIndex = 12;			 //otherwise its in Meskerem 
			else 
				monthIndex = 0;
		
	//Calculate total number of days starting from the Ethiopian New Year (Sept. 11) and make adjustments
	//to incorporate leap years 
	for ( i = 0; i < monthIndex; i++ )
		days += gregNumDays[ i ];
	
	days += gregDay;
	
	if ( isEthLeapYear ( ethYear - 1 ) ) //If last year is leap year, Meskerem 1 is on Sept. 12
		days -= 1;  					 //so subtract 1 from gregNumDays[0]
	
	if ( gregMonth > 2 )					//If Gregorian month is February (2) and this Gregorian 
		if ( isGregLeapYear ( gregYear ) )	//year is leap year then add one
			days += 1;

	return days;
}
			
function gregToEthMonth ( gregYear, gregMonth, gregDay ) {
	var days, ethMonth;
	
	days = daysFromSept ( gregYear, gregMonth, gregDay );
	if ( days <= 360 ) {
		ethMonth = Math.floor( days / 30 );
		if ( days % 30 == 0 )
			ethMonth -= 1;
	}
	else 
		ethMonth = 12;
	
	return ethMonth;
}

// Cookie's