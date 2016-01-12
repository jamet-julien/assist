/**
 * [Editable description]
 * @param {[type]} oOption [description]
 */
var Assist = function( oOption){

	this._bClosable   = false;
	this._oMenuTool   = null;
	this._oCursor     = null;
	this._oTarget     = null;
	this._oSelect     = null;
	this._sSelection  = '';

	this._bActif        = true;

	this.aItems       = oOption.items;
	this.fIsValid     = ( typeof( oOption.isValid) != 'undefined')? oOption.isValid : function( e){return true;};

	this._init();
	this._initMouseAction();

};

/**
 * [_init description]
 * @return {[type]} [description]
 */
Assist.prototype._init = function(){

	this._oMenuTool = this._buildMenu();
};

/**
 * [_buildSelectZone description]
 * @return {[type]} [description]
 */
Assist.prototype._buildSelectZone = function( sText){

	var range          = window.getSelection().getRangeAt(0);

	var oElementText   = document.createTextNode( sText);

	var oElementSelect = document.createElement('span');
	oElementSelect.setAttribute('id', 'select-js');


	var oElementCursor = document.createElement('span');
	oElementCursor.setAttribute('id', 'cursor-js');


	oElementSelect.appendChild( oElementCursor);
	oElementSelect.appendChild( oElementText);

	this._oSelect = oElementSelect;

	range.deleteContents();
	range.insertNode( oElementSelect);

	return oElementCursor;

};

/**
 * [_initMouseAction description]
 * @return {[type]} [description]
 */
Assist.prototype._initMouseAction = function(){

	var self = this;

	/**
	 * [onmouseup description]
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	document.body.onmouseup=function( e){
		var sSelection    = String( self._getSelection());
		var oElementClick = e.target;


		if( sSelection.trim() !== '' &&
		 		self.fIsValid.call( self, sSelection, oElementClick) &&
		  	self._bActif){

			self._oMenuTool.className = 'active';
			self._oCursor             =  self._buildSelectZone( sSelection);
			self._sSelection          =  sSelection;
			self._oTarget             =  self._oCursor.parentNode.parentNode;

			self._displayMenuTool();

		}
	};

	/**
	 * [onmousedown description]
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	document.body.onmousedown=function( e){

				//LI    > UL       > DIV
		if( e.target.parentNode.parentNode != self._oMenuTool && self._bClosable){
			self.closeTool();
		}
	};

	/**
	 * [onmouseover description]
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	self._oMenuTool.onmouseover=function( e){
		self._bClosable = false;
	};

	/**
	 * [onmouseleave description]
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	self._oMenuTool.onmouseleave=function( e){
		self._bClosable = true;
	};
};

/**
 * [setActif description]
 */
Assist.prototype.setActif = function( bActif){
	this._bActif = bActif;
};

/**
 * [closeTool description]
 * @return {[type]} [description]
 */
Assist.prototype.closeTool = function( ){

	if( document.getElementById('select-js')){// si il existe dejà alors on le supprime en remettant tout en ordre
		var oElementText   = document.createTextNode( this._sSelection);
		this._oTarget.replaceChild( oElementText, this._oSelect);
	}

	this._oMenuTool.className = '';
	this._oMenuTool.innerHTML = '';
	this._oTarget             = null;
	this._bActif              = true;

};

/**
 * [_removeCursor description]
 * @return {[type]} [description]
 */
Assist.prototype._removeCursor = function(){
	var oParent = this._oCursor.parentNode;
	oParent.removeChild( this._oCursor);
	return this;
};

/**
 * [_moveMenuTool description]
 * @return {[type]} [description]
 */
Assist.prototype._moveMenuTool = function(){

	var oRectSelec             = this._oCursor.getBoundingClientRect();
	var oRectTool              = this._oMenuTool.getBoundingClientRect();

	var iNewPosTop             = oRectSelec.top + window.pageYOffset - oRectTool.height ;

	this._oMenuTool.style.left = oRectSelec.left+'px';
	this._oMenuTool.style.top  = iNewPosTop+'px';

	this._removeCursor();
	return this;

};

/**
 * [_buildMenuAction description]
 * @return {[type]} [description]
 */
Assist.prototype._buildMenuAction = function(){
	var oMenuTool = document.createElement('ul');
	var self      = this;

	this._bActif  = false;

	for( var sKey in this.aItems){

		var oOpt = this.aItems[sKey];

		if( typeof( oOpt.isShow) == 'undefined' || oOpt.isShow( this._sSelection, this._oTarget)){

			var oLi = document.createElement( 'li');

			oLi.setAttribute( "class", oOpt.className);

			if( typeof( oOpt.clickAction) != 'undefined'){

				oLi.addEventListener( 'mousedown',( function( fFunction){

					return function( e){
						var oElement  = fFunction.call( null , self._sSelection, self._oTarget);

						if( oElement.nodeType == Node.ELEMENT_NODE){

							self._oTarget.replaceChild( oElement, self._oSelect);
						}

						self.closeTool();
					};

				})( oOpt.clickAction));

			}

			oMenuTool.appendChild( oLi);
		}

	}

	return oMenuTool;

};

/**
 * [_displayMenuTool description]
 * @return {[type]} [description]
 */
Assist.prototype._displayMenuTool = function() {

	this._oMenuTool.innerHTML = '';
	oMenuTool                 = this._buildMenuAction();
	this._oMenuTool.appendChild( oMenuTool);

	this._moveMenuTool();
	return this;
};

/**
 * [_getSelection description]
 * @return {[type]} [description]
 */
Assist.prototype._getSelection = function(){

	if( window.getSelection) {

		return window.getSelection();

	}else if( document.getSelection){

		return document.getSelection();

	}else{
		var oSelection = document.selection && document.selection.createRange();

		if( oSelection.text) {
			return oSelection.text;
		}

		return false;
	}
};


/**
 * [_init description]
 * @return {[type]} [description]
 */
Assist.prototype._buildMenu = function(){

	var oDivTool  = document.createElement('div');
	oDivTool.setAttribute('id', 'assist-js');

	document.body.appendChild( oDivTool);
	return oDivTool;
};
