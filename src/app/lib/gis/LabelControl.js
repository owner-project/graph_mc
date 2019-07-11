//@ sourceURL=LabelControl.js

// 自定义文本控件
window.LabelControl = function(content) {
    // 默认停靠位置和偏移量
    this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
    this.defaultOffset = new BMap.Size(150, 0);
    this.content = content;
}

LabelControl.prototype = new BMap.Control();

// 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
// 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
LabelControl.prototype.initialize = function(map){
    var $ctrlDom = $("<div>").addClass("bdp-gislabel-control").html(this.content);
    this.$container = $ctrlDom;

    // 添加DOM元素到地图中
    var div = $ctrlDom.get(0);
    map.getContainer().appendChild(div);

    return div;

}

LabelControl.prototype.setContent = function(content) {
	this.$container.html(content);

}

LabelControl.prototype.reset = function() {
    this.$container.html("");
}

LabelControl.prototype.show = function() {
    this.$container.show();
}