$(function($, _, Backbone) {
  'use strict';

  var SelectorWidget = window.SelectorWidget = Backbone.View.extend({
    tagName: 'div',
    className: 'selector-widget-container',
    template: _.template($('#selector-widget').html()),
    events: {
      click: '_onClick',
      'keyup .search': '_onSearch',
      'change .search': '_onSearch',
      'click .controls-container .clear': '_onClear'
    },
    initialize: function(opts) {
      var that = this;
      this.opts = opts;
      setTimeout(function() { $('body').on('click', that.remove.bind(that)) });

      // create item views
      // TODO: handle groups
      this.items = _.map(opts.items, function(v) {
        var view;
        if(v.group) view = new ItemGroupView({group: v});
        else view = new ItemView({item: v});

        that.listenTo(view, 'selected', that._onItemSelection);
        return view;
      });

    },
    _onSearch: function(e) {
      _.each(this.items, function(v) { v.search(e.target.value); });
    },
    _onClear: function() {
      this.$('.search').val('').change();
      this.$('.search').focus();
    },
    _onItemSelection: function(item) {
      this.trigger('selection', item);
      this.remove();
    },
    _onClick: function(e) { e.stopPropagation(); },
    remove: function() {
      _.invokeMap(this.items, 'remove');
      return Backbone.View.prototype.remove.apply(this);
    },
    render: function() {
      var that = this;
      this.$el.append(this.template({}));
      _.each(this.items, function(item) {
        that.$('.list-container').append(item.render().$el);
      });
      setTimeout(function() { that.$('.search').focus(); });
      return this;
    }
  });

  var ItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'item',
    template: _.template($('#selector-widget-item').html()),
    events: {
      click: '_onClick',
      'click .help': '_onHelp'
    },
    initialize: function(opts) {
      this.data = opts.item;
    },
    render: function() {
      this.$el.append(this.template({data: this.data}));
      if(this.data.help) this.$('.help').show();
      return this;
    },
    _onClick: function() {
      this.trigger('selected', this.data);
    },
    _onHelp: function(e) {
      e.stopPropagation();
      console.log(this.data.help.value);
    },
    search: function(query) {
      var match = false;
      query = query.toLowerCase();

      if(this.data.displayValue) match = match || this.data.displayValue.toLowerCase().indexOf(query) !== -1;
      match = match || this.data.value.toLowerCase().indexOf(query) !== -1;

      if(match) this.show();
      else this.hide();
      return match;
    },
    hide: function() { this.$el.hide(); },
    show: function() { this.$el.show(); },
  });

  var ItemGroupView = Backbone.View.extend({
    tagName: 'div',
    className: 'group-container',
    template: _.template($('#selector-widget-group').html()),
    initialize: function(opts) {
      var that = this;
      this.data = opts.group;

      this.items = _.map(this.data.items, function(v) {
        var view;
        if(v.group) view = new ItemGroupView({group: v});
        else view = new ItemView({item: v});

        that.listenTo(view, 'selected', that._onItemSelection);
        return view;
      });
    },
    search: function(query) {
      var match = _.some(_.invokeMap(this.items, 'search', query));
      if(match) this.show();
      else this.hide();
      return match;
    },
    hide: function() { this.$el.hide(); },
    show: function() { this.$el.show(); },
    _onItemSelection: function(item) { this.trigger('selected', item); },
    render: function() {
      var that = this;
      this.$el.append(this.template({data: this.data}));
      _.each(this.items, function(item) {
        that.$('.items-container').append(item.render().$el);
      });
      return this;
    },
    remove: function() {
      _.invokeMap(this.items, 'remove');
      return Backbone.View.prototype.remove.apply(this);
    }
  });


}($, _, Backbone));
