
![Logo](https://res.cloudinary.com/dwinzyahj/image/upload/c_crop,h_70,q_auto:best,w_245/v1698839380/1_gobnfb.png)


The extra ordinary validation package for express applications

## Why
There are already validation packages that work with express already, why another package? Well, the problem is they make validation more complicated than it has to be.


## Installation

This package can be installed from npm in an existing express js app

```bash
yarn add @flixtechs/ordinary
```

## Usage/Examples
Using this package is easy, you just need to register the middleware and error handler. The middleware is registered before you define your routes. Make sure it's registered after you register the body parsers

Then register the error handler after all your middleware has been registered but before your custom error handler so other errors that are not validation errors can be handled

```javascript
import { ordinary, remarkable } from '@flixtechs/ordinary'

// register body parser and what not

app.use(ordinary(app))

//your routes and other middleware

app.use(remarkable)

//your error handlers
```

Now you can validate incoming input in your routes like this

```javascript
router.post('/login', async (req, res, next) => {
    const { email, password } = await req.validate({
        email: 'required|string|email|max:255',
        password: 'required|string|min:8',
    })
    .catch(error => next(error))

    //compare password

    return res.back()

}

```

If there is a validation error it will throw a `ValidationError` exception hence the `.catch` on the promise. We then forward that error to the next middleware so the exception is handled by express.

For express 5 and above there's no need to handle the exception because express does this automatically under the hood which leaves us with clean code

The **remarkable** error handler will return a `422 Unprocessable Entity` if the request is expecting json with the errors in the response body like in the example below

```json
{
    "message": "UNPROCESSABLE_ENTITY",
    "errors": {
        "email": [
            "These credentials do not match our records"
        ]
    }
}
```
If it was a normal traditional web request it will redirect back with errors and old input the session. 

Currently it does not have helper functions for template engines but will be available soon. In the meantime you have to manually check the session for the errors key then display errors and old nput accordingly

Errors will be in the `errors` key and old input in the `old` key

## Helper methods
This package also adds a few methods to the `req` object to help handle incoming input

### safe
Returns a collection instance of safe and validated input. By `safe` we mean the input that you specified needs validation for example if your validation rules look like this

```
{
    email: 'required|string|,
    password: 'required|string'
}
```
If the request body comes with extra input say `name` then calling `safe()` will only return 
`email` and `password` other input will be ignored

Example usage of this method

```javascript
router.post('/register', async (req, res, next) => {
    await req.validate({
        email: 'required|string|email|max:255',
        password: 'required|string|min:8|confirmed',
        name: 'required|string|max:255'
    })
    .catch(error => next(error))

    await User.create(req.safe().all())

    return res.back()

}
```

### validated
Works the same way as `safe()` but instead of returning a collection it returns a plain object

```javascript
router.post('/register', async (req, res, next) => {
    await req.validate({
        email: 'required|string|email|max:255',
        password: 'required|string|min:8|confirmed',
        name: 'required|string|max:255'
    })
    .catch(error => next(error))

    await User.create(req.validated())

    return res.back()

}
```

Also accepts keys to return only those keys

```javascript
router.post('/register', async (req, res, next) => {
    await req.validate({
        email: 'required|string|email|max:255',
        password: 'required|string|min:8|confirmed',
        name: 'required|string|max:255'
    })
    .catch(error => next(error))

    await User.create(req.validated('email', 'password')) //name will not be included

    return res.back()

}
```

### only

Works the same way as `validated()` except as the name suggest it returns **only** the specified keys

```javascript
req.only('name', 'email')
```

### has
Checks if the incoming request body has a specific key

```javascript
if(req.has('subscribe')) {
    // subscribe user to the newsletter
}
```

### missing
Checks if a key is missing in the request body

### input
Returns the value of the specified key

```javascript
const name = req.input('name')
```

## Form Requests
For more complex validation scenarios, you may wish to create a "form request". Form requests are custom request classes that encapsulate their own validation logic. 

### Creating form requests

All form requests are classes extending the `Request` class. Create a directory

`requests/` and create a file `requests/StorePostRequest`

```javascript
//requests/StorePostRequest.js
export class StorePostRequest extends FormRequest {
    rules() {
        return {
            title: 'required|string|max:255|min:3',
            body: 'required|string|max:255|min:3',
            status: 'required|string|in:draft,published'
        };
    }
}
```
As you might have guessed, the rules method returns the validation rules that should apply to the request's data

So, how are the validation rules evaluated? All you need to do is call the `init(req.body)` method of the request on your controller method with the `req.body` as argument. The method is a static method called once at the begining of your controller action meaning you won't have to clutter your controller with validation logic. The init method returns a promise like most validation methods in this package

```javascript
import { StorePostRequest } from '../requests/StorePostRequest.js'

router.post('/posts', (req, res, next) => {
    const request = await StorePostRequest.init(req.body).catch(next)

    // The incoming request is valid...
 
    // Retrieve the validated input data...
    const validated = request.validated()

    // Retrieve a portion of the validated input data...
    const validated = request.validated('title', 'body')
    const validated = request.except('status', 'title')

    //store the blog post

    return res.redirect('/posts')
})
```
If validation fails, a redirect response will be generated to send the user back to their previous location. The errors will also be flashed to the session so they are available for display. If the request was an XHR request, an HTTP response with a 422 status code will be returned to the user including a JSON representation of the validation errors.

### Customizing The Error Messages
You may customize the error messages used by the form request by overriding the messages method. This method should return an object of attribute / rule pairs and their corresponding error messages:

```javascript
//requests/StorePostRequest.js
export class StorePostRequest extends FormRequest {
    rules() {
        return {
            title: 'required|string|max:255|min:3',
            body: 'required|string|max:255|min:3',
            status: 'required|string|in:draft,published'
        };
    }

    messages() {
        return {
            'title.required': 'Every blog post needs a good title!'
        }
    }
}
```

## Available Validation Rules
This package is built on top of [simple-body-validator](https://www.simple-body-validator.com) and it uses all the [validation rules](https://www.simple-body-validator.com/available-validation-rules) said in their docs



## Running Tests

To run tests, run the following command

```bash
  npm run test
```


## Support

For support, email given@flixtechs.co.zw

