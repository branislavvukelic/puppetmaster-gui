var express = require('express')
var router = express.Router()
var PlatformOption = require('../platform-options/model')
var Installation = require('./model')

router.get('/', function (req, res, next) {
  var selectedEnvironmentData = req.cookies.platformName
  PlatformOption.getEnvironmentFromDatabase(req.cookies.platformName, function (data) {

      PlatformOption.getAllRoles(function (roleData) {
        if(data)
          var platData = JSON.parse(data.json_data.replace(/(^")|("$)/g, ""));
        res.render('installation/installation', { platformData: platData, roleData: roleData, selectedEnvironment: selectedEnvironmentData })
      },
      function (error) {
        error.message = 'Could not load roles'
        next(error)
      })

  },
  function (error) {
    error.message = 'Could not load environment'
    next(error)
  })
})

router.post('/schedule', function (req, res, next) {
  var orderId = req.body.orderId
  PlatformOption.getEnvironmentFromDatabase(req.cookies.platformName, function (data) {
    Installation.scheduleInstallationFromJson(data.id, req.cookies.platformName, orderId, JSON.parse(data.json_data.replace(/(^")|("$)/g, "")), function() {
      if (!res.headerSent) {
        res.json({'status': 'ok'})
        return
      }
      return
    },
    function (error) {
      error.message = 'Could not schedule installation'
      next(error)
    }
  )
  },
  function (error) {
    error.message = 'Could not load environment'
    next(error)
  })

})

router.put('/task/:taskId', function (req, res) {
  var taskId = req.params.taskId
  var status = req.body.status

  Installation.updateTask (taskId, status, function () {
    res.json({'status':'ok'})
  }, function (error) { res.json({'status':error})})
})

router.get('/task/:taskId', function (req, res) {
  var taskId = req.params.taskId

  Installation.getTaskByRunId (taskId, function (result) {
    res.json({'task':result})
  }, function (error) { res.json({'status':error})})
})

module.exports = router
