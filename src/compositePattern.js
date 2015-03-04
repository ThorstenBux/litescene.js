//TODO: a class to remove the tree methods from SceneTree and SceneNode
/**
* CompositePattern implements the Composite Pattern, which allows to one class to contain instances of its own class
* creating a tree-like structure.
* @class CompositePattern
* @constructor
*/
function CompositePattern()
{
	//WARNING! do not add anything here, it will never be called
}

CompositePattern.prototype.compositeCtor = function()
{
}

/**
* Adds one child to this instance
* @method addChild
* @param {*} child
* @param {number} index [optional]  in which position you want to insert it, if not specified it goes to the last position
* @param {*} options [optional] data to be passed when adding it, used for special cases when moving nodes around
**/

CompositePattern.prototype.addChild = function(node, index, options)
{
	//be careful with weird recursions...
	var aux = this;
	while( aux._parentNode )
	{
		if(aux == node)
			throw("addChild: Cannot insert a node as his own child");
		aux = aux._parentNode;
	}

	//has a parent
	if(node._parentNode)
		node._parentNode.removeChild(node, options);

	/*
	var moved = false;
	if(node._parentNode)
	{
		moved = true;
		node._onChangeParent(this, options);
		//remove from parent children
		var pos = node._parentNode._children.indexOf(node);
		if(pos != -1)
			node._parentNode._children.splice(pos,1);
	}
	*/

	//attach to this
	node._parentNode = this;
	if( !this._children )
		this._children = [node];
	else if(index == undefined)
		this._children.push(node);
	else
		this._children.splice(index,0,node);


	//Same tree
	node._in_tree = this._in_tree;

	if(this._onChildAdded)
		this._onChildAdded(node, options);

	LEvent.trigger(this,"childAdded", node);
	if(this._in_tree)
	{
		LEvent.trigger(this._in_tree, "treeItemAdded", node);
		inner_recursive(node);
	}
	

	//recursive action
	function inner_recursive(item)
	{
		if(!item._children) return;
		for(var i in item._children)
		{
			var child = item._children[i];
			if(!child._in_tree && item._in_tree)
			{
				LEvent.trigger( item._in_tree, "treeItemAdded", child );
				child._in_tree = item._in_tree;
			}
			inner_recursive( child );
		}
	}
}

/**
* Removes the node from its parent (and from the scene tree)
*
* @method removeChild
* @param {Node} node this child to remove
* @param {Object} options 
* @return {Boolean} returns true if it was found and removed
*/
CompositePattern.prototype.removeChild = function(node, options)
{
	if(!this._children || node._parentNode != this) return false;
	if( node._parentNode != this) return false; //not his son
	var pos = this._children.indexOf(node);
	if(pos == -1) return false; //not his son �?
	this._children.splice(pos,1);

	if(this._onChildRemoved)
		this._onChildRemoved(node, options);

	LEvent.trigger(this,"childRemoved", node);

	if(node._in_tree)
	{
		LEvent.trigger(node._in_tree, "treeItemRemoved", node);

		//propagate to childs
		inner_recursive(node);
	}
	node._in_tree = null;

	//recursive action
	function inner_recursive(item)
	{
		if(!item._children) return;
		for(var i in item._children)
		{
			var child = item._children[i];
			if(child._in_tree)
			{
				LEvent.trigger( child._in_tree, "treeItemRemoved", child );
				child._in_tree = null;
			}
			inner_recursive( child );
		}
	}

	return true;
}

/**
* Serialize the data from all the children
*
* @method serializeChildren
* @return {Array} array containing all serialized data from every children
*/
CompositePattern.prototype.serializeChildren = function()
{
	var r = [];
	if(this._children)
		for(var i in this._children)
			r.push( this._children[i].serialize() ); //serialize calls serializeChildren
	return r;
}

/**
* Configure every children with the data
*
* @method configureChildren
* @return {Array} o array containing all serialized data 
*/
CompositePattern.prototype.configureChildren = function(o)
{
	if(!o.children) return;

	for(var i in o.children)
	{
		//create instance
		var node = new this.constructor(o.children[i].id); //id is hardcoded...
		this.addChild(node);
		node.configure(o.children[i]);
	}
}

/**
* Returns parent node
*
* @method getParent
* @return {SceneNode} parent node
*/
CompositePattern.prototype.getParent = function()
{
	return this._parentNode;
}

CompositePattern.prototype.getChildren = function()
{
	return this._children || [];
}

/*
CompositePattern.prototype.childNodes = function()
{
	return this._children || [];
}
*/

//DOM style
Object.defineProperty( CompositePattern.prototype, "childNodes", {
	enumerable: true,
	get: function() {
		return this._children || [];
	},
	set: function(v) {
		//TODO
	}
});

Object.defineProperty( CompositePattern.prototype, "parentNode", {
	enumerable: true,
	get: function() {
		return this._parentNode;
	},
	set: function(v) {
		//TODO
	}
});

Object.defineProperty( CompositePattern.prototype, "scene", {
	enumerable: true,
	get: function() {
		return this._in_tree;
	},
	set: function(v) {
		throw("Scene cannot be set, you must use addChild in parent");
	}
});

/**
* get all nodes below this in the hierarchy (children and children of children)
*
* @method getDescendants
* @return {Array} array containing all descendants
*/
CompositePattern.prototype.getDescendants = function()
{
	if(!this._children || this._children.length == 0)
		return [];
	var r = this._children.concat();
	for(var i = 0;  i < this._children.length; ++i)
		r = r.concat( this._children[i].getDescendants() );
	return r;
}


