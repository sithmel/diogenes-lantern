diogenes-lantern
================
This package visualise the dependency graph of a diogenes registry.
It helps understanding the code in a visual way.

![graph](https://user-images.githubusercontent.com/460811/37313595-dda352c0-2647-11e8-86fd-da7f6055ebf5.png)

How to use it
-------------
The idea is to import it as express middleware:
```js
const express = require('express');
const lanternMiddleware = require('diogenes-lantern');

const app = express();

app.get('/', lanternMiddleware(getRegistry, { title: 'test' }))
app.listen(3000, () => console.log('Listening at: http://localhost:3000'))
```
The middleware takes a function that returns a diogenes registry.
This function takes req and res as argument so it is able to extract a registry from there if necessary.

When hitting the endpoint you get a representation of the dependency graph. You can inspect every node and get helpful info such as documentation, file and line number etc.
Here's an example implementation of getRegistry:
```js
const getRegistry = (req, res) => registry.clone().addDeps({ req, res })
```
The "clone" ensure I am not changing the original registry.

![graph2](https://user-images.githubusercontent.com/460811/37313680-339d43b6-2648-11e8-987a-6f14c26809a6.png)
