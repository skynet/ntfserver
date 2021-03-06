var shared = require('../shared')

var Agent = exports.Agent = function Agent() {}

Agent.cache = {}
Agent.error = function(text) { return new Error('Agent ' + text) }

Agent.setup = function(cb) {
  shared.sql.query(
    'CREATE TABLE IF NOT EXISTS agent (' +
    '  `agent_id` int unsigned auto_increment NOT NULL,' +
    '  `name` varchar(255) NOT NULL,' +
    '  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,' +
    '  PRIMARY KEY (`agent_id`),' +
    '  UNIQUE KEY (`name`),' +
    '  KEY (`create_time`)' +
    ') ENGINE=InnoDB default CHARSET=utf8 COLLATE=utf8_bin', cb)
}

Agent.getOrInsert = function(obj, cb) {
  if (typeof(obj) !== 'object')
    return cb(Agent.error('requires object'))
  if (typeof(obj.name) !== 'string')
    return cb(Agent.error('invalid name type'))
  if (Agent.cache.hasOwnProperty(obj.name))
    return cb(null, Agent.cache[obj.name])

  shared.sql.query(
    'INSERT INTO agent (name) VALUES (?)' +
    '  ON DUPLICATE KEY UPDATE agent_id = last_insert_id(agent_id)',
    [obj.name],
  function(err, info) {
    if (err) return cb(err)
    Agent.cache[obj.name] = info.insertId
    cb(null, info.insertId)
  })
}
