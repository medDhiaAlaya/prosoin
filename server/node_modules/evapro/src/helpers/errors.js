export class CustomError extends Error {
  constructor (message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

export class GenericError extends CustomError {
  constructor (message = 'An error occured!') {
    super(message, 400)
  }
}

export class ConflictError extends CustomError {
  constructor (message = 'Data already exists!') {
    super(message, 409)
  }
}
export class BadRequestError extends CustomError {
  constructor (message = 'Bad Request!') {
    super(message, 400)
  }
}

export class MissingDataError extends CustomError {
  constructor (message = 'Missing Data!') {
    super(message, 422)
  }
}

export class NotFoundError extends CustomError {
  constructor (message = 'Not Found!') {
    super(message, 404)
  }
}

export class UnauthorizedError extends CustomError {
  constructor (message = 'Unauthorized!') {
    super(message, 400)
  }
}

export class ForbiddenError extends CustomError {
  constructor (message = 'Forbidden!') {
    super(message, 403)
  }
}

export class InternalError extends CustomError {
  constructor (message = 'An Error Occured! Please try again.') {
    super(message, 500)
  }
}

export class ValidationError extends CustomError {
  constructor (message = 'Validation Error') {
    super(message, 400)
  }
}
