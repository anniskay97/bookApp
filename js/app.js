/*global Vue, bookStorage */

(function (exports) {

	'use strict';

	var filters = {
		all: function (books) {
			return books;
		},
		active: function (books) {
			return books.filter(function (book) {
				return !book.completed;
			});
		},
		completed: function (books) {
			return books.filter(function (book) {
				return book.completed;
			});
		}
	};

	exports.app = new Vue({

		// the root element that will be compiled
		el: '.bookapp',

		// app initial state
		data: {
			books: bookStorage.fetch(),
			newbook: '',
			editedbook: null,
			visibility: 'all'
		},

		// watch books change for localStorage persistence
		watch: {
			books: {
				deep: true,
				handler: bookStorage.save
			}
		},

		// computed properties
		// http://vuejs.org/guide/computed.html
		computed: {
			filteredbooks: function () {
				return filters[this.visibility](this.books);
			},
			remaining: function () {
				return filters.active(this.books).length;
			},
			allDone: {
				get: function () {
					return this.remaining === 0;
				},
				set: function (value) {
					this.books.forEach(function (book) {
						book.completed = value;
					});
				}
			}
		},

		// methods that implement data logic.
		// note there's no DOM manipulation here at all.
		methods: {

			pluralize: function (word, count) {
				return word + (count === 1 ? '' : 's');
			},

			addbook: function () {
				var value = this.newbook && this.newbook.trim();
				if (!value) {
					return;
				}
				this.books.push({ id: this.books.length + 1, title: value, completed: false });
				this.newbook = '';
			},

			removebook: function (book) {
				var index = this.books.indexOf(book);
				this.books.splice(index, 1);
			},

			editbook: function (book) {
				this.beforeEditCache = book.title;
				this.editedbook = book;
			},

			doneEdit: function (book) {
				if (!this.editedbook) {
					return;
				}
				this.editedbook = null;
				book.title = book.title.trim();
				if (!book.title) {
					this.removebook(book);
				}
			},

			cancelEdit: function (book) {
				this.editedbook = null;
				book.title = this.beforeEditCache;
			},

			removeCompleted: function () {
				this.books = filters.active(this.books);
			}
		},

		// a custom directive to wait for the DOM to be updated
		// before focusing on the input field.
		// http://vuejs.org/guide/custom-directive.html
		directives: {
			'book-focus': function (el, binding) {
				if (binding.value) {
					el.focus();
				}
			}
		}
	});

})(window);