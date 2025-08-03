import fs from 'fs'
const deleteFiles = {
  multiple: (files) => {
    if (files) {
      for (const file of files) {
        if(file){
          fs.unlink(
            './uploads/' + file.filename,
            (err) => err ?? console.log(err)
          )
        }
      }
    }
  },
  single: (file) => {
    if (file) {
      fs.unlink(
        './uploads/' + file.filename,
        (err) => err ?? console.log(err)
      )
    }
  }

}

export default deleteFiles
