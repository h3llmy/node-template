import { successResponse } from '../vendor/response.js'

import Example from '../model/exampleModel.js'
import { deleteFile, saveFile, uploadFile } from '../vendor/uploadFile.js'
import validate from '../vendor/validator.js'
import createCsv from '../vendor/createCsv.js'
import CustomError from '../vendor/customError.js'

export const add = async (req, res, next) => {
  try {
    validate(req.body, {
      example: { required: true, type: String },
      userId: { required: true, type: String },
    })
    validate(req.files, {
      picture: { type: Object },
    })

    const file = uploadFile(req.files.picture, { gte: 10 })
    const newValue = await Example.create({
      example: req.body.example,
      picture: file?.filePath,
      userId: req.body.userId,
    })

    if (file) {
      saveFile(file)
    }

    res.json(successResponse(newValue))
  } catch (error) {
    next(error)
  }
}

export const list = async (req, res, next) => {
  try {
    const example = await Example.paginate(req.auth.filter, req.query)

    res.json(successResponse(example))
  } catch (error) {
    next(error)
  }
}

export const createReport = async (req, res, next) => {
  try {
    const fileName = 'report-' + Date.now()
    const examples = Example.find().cursor()

    let report
    examples.on('data', async (example) => {
      report = createCsv(fileName,
        {
          example: example.example,
          picture: example.picture,
          userId: example.userId.id,
          createdAt: example.createdAt
        }
      )
    })
    examples.on('end', () => {
      res.json(successResponse(report))
    })
  } catch (error) {
    next(error)
  }
}

export const detail = async (req, res, next) => {
  try {
    const example = await Example.findOne({
      _id: req.params.example_id,
    }).orFail(new CustomError('Example not found', 404))

    res.json(successResponse(example))
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    validate(req.body, {
      example: { required: true, type: String },
    })
    validate(req.files, {
      picture: { type: Object },
    })
    const file = uploadFile(req.files.picture, { gte: 10 })
    const example = await Example.findOne({
      _id: req.params.example_id,
    }).orFail(new CustomError('Example not found', 404))

    if (example.picture != file.filePath) {
      deleteFile(example.picture)
    }

    example.example = req.body.example
    example.picture = file.filePath

    const updateExample = await example.save()

    saveFile(file)

    res.json(successResponse(updateExample, 'Example updated'))
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const deleteExample = await Example.softDelete({ _id: req.params.example_id })
    res.json(successResponse(deleteExample, 'Example deleted'))
  } catch (error) {
    next(error)
  }
}

export const removeFile = async (req, res, next) => {
  try {
    const exampleFind = await Example.findOne({
      _id: req.params.file_id,
    }).orFail(new CustomError('example not found', 404))

    deleteFile(exampleFind.picture)

    exampleFind.picture = undefined

    exampleFind.save()
    res.json(successResponse(exampleFind))
  } catch (error) {
    next(error)
  }
}
