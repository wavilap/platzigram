var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/', function (ctx, next) {
	title('Platzigram');
  var main = document.getElementById('main-container');

  var pictures = [
    {
      user: {
        username: 'wavilap',
        avatar: 'https://scontent-mia1-1.xx.fbcdn.net/v/t1.0-0/p206x206/62958_1667857895724_1933507_n.jpg?oh=6ad62cecf801bdda82cea4888deaab8a&oe=58654FA5'
      },
      url: 'office.jpg',
      likes: 20,
      liked: true
    },
    {
      user: {
        username: 'deathmask',
        avatar: 'https://scontent-mia1-1.xx.fbcdn.net/v/t1.0-0/p206x206/62958_1667857895724_1933507_n.jpg?oh=6ad62cecf801bdda82cea4888deaab8a&oe=58654FA5'
      },
      url: 'office.jpg',
      likes: 15,
      liked: false
    } 
  ];

  empty(main).appendChild(template(pictures));
})
