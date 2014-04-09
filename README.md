##AngularDrop [![Build Status](https://travis-ci.org/caitp/angular-drop.svg?branch=master)](https://travis-ci.org/caitp/angular-drop) [![devDependency Status](https://david-dm.org/caitp/angular-drop/dev-status.svg)](https://david-dm.org/caitp/angular-drop#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/caitp/angular-drop/badge.png?branch=master)](https://coveralls.io/r/caitp/angular-drop?branch=master)

###Drag & Drop functionality in AngularJS, no jQuery required

[Demo](http://caitp.github.io/angular-drop) | [Docs](http://caitp.github.io/angular-drop/docs)

AngularDrop provides simple building blocks for Drag & Drop functionality in AngularJS.

Drag & Drop is a fairly complex user interaction, even though it might seem trivial initially. It is further complicated in AngularJS by the concept of scopes, which can have a major impact on the content of a drag/dropped node.

I do not claim to have the answers to any or all of the questions raised by implementing drag & drop functionality in a complex application, but I am interested in finding out so that we can deliver the best experience possible to users of our apps.

With the best intentions, it is hoped that we will be able to deliver:

- Full support for mobile applications
- Cleverly handling scope-changing
- Scope events fired when elements are dragged and dropped
- Support for dragging and dropping between nested browsing contexts
- Support for dragging and dropping between different windows

This library is not simply a pair of directives, but is in fact also building blocks for creating custom directives with specialized Drag & Drop behaviour.

###Contributing

I'd be grateful for any form of contribution, whether it be the creation of demo pages, bug reports, documentation, feature requests, or above all else, patches.

Patches should follow the [Google JavaScript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml), and each and every new feature or bug fix should incorporate one or more meaningful tests to assist in preventing future regressions.

While you may, if you so wish, discuss this module anywhere you like, I will be most likely to respond to inquiries directed to me on IRC (particularly in #angularjs on irc.freenode.net), or on the [issue tracker](https://github.com/caitp/angular-drop/issues).

###License

The MIT License (MIT)

Copyright (c) 2013 Caitlin Potter & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
