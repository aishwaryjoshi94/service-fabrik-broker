'use strict';

const nock = require('nock');
const credentials = {
  host: 'example.org:31415',
  uri: 'mongodb://5e91c9e75a0aec0a4d8e9c3523887576:12b6ca434be2dd8716d1009eb280e1c5@10.244.10.160:27017,10.11.252.21:27017,10.11.252.22:27017/8354aac89a3781b8?replicaSet=282477f09a2704e7e1ab1396f7721acc'
};

const agentIp = '10.244.10.160';
const agentUrl = `http://${agentIp}:2718`;

exports.ip = agentIp;
exports.url = agentUrl;
exports.credentials = credentials;
exports.getInfo = getInfo;
exports.getState = getState;
exports.deprovision = deprovision;
exports.createCredentials = createCredentials;
exports.deleteCredentials = deleteCredentials;
exports.startBackup = startBackup;
exports.abortBackup = abortBackup;
exports.lastBackupOperation = lastBackupOperation;
exports.getBackupLogs = getBackupLogs;
exports.startRestore = startRestore;
exports.abortRestore = abortRestore;
exports.lastRestoreOperation = lastRestoreOperation;
exports.getRestoreLogs = getRestoreLogs;

function getInfo(times) {
  return nock(agentUrl)
    .replyContentLength()
    .get('/v1/info')
    .times(times || 1)
    .reply(200, {
      api_version: '1',
      supported_features: ['state', 'lifecycle', 'credentials', 'backup', 'restore', 'multi_tenancy']
    });
}

function getState(isOperational, details) {
  return nock(agentUrl, {
      reqheaders: {
        authorization: /^basic/i
      }
    })
    .replyContentLength()
    .get('/v1/state')
    .reply(200, {
      operational: !!isOperational,
      details: details
    });
}

function deprovision() {
  return nock(agentUrl)
    .replyContentLength()
    .post('/v1/lifecycle/deprovision', {})
    .reply(200, {});
}

function createCredentials() {
  return nock(agentUrl)
    .replyContentLength()
    .post('/v1/credentials/create')
    .reply(200, credentials);
}

function deleteCredentials() {
  return nock(agentUrl)
    .post('/v1/credentials/delete', {
      credentials: credentials
    })
    .reply(200);
}

function startBackup() {
  return nock(agentUrl)
    .post('/v1/backup/start', body => {
      expect(body.backup).to.be.an('object');
      expect(body.vms).to.be.an.instanceof(Array);
      expect(body.vms[0]).to.have.property('cid');
      expect(body.vms[0]).to.have.property('index');
      expect(body.vms[0]).to.have.property('job');
      expect(body.vms[0]).to.have.property('iaas_vm_metadata');
      return true;
    })
    .reply(202, {});
}

function abortBackup() {
  return nock(agentUrl)
    .post('/v1/backup/abort', {})
    .reply(202, {});
}

function lastBackupOperation(body) {
  return nock(agentUrl)
    .get('/v1/backup')
    .reply(200, body);
}

function getBackupLogs(logs) {
  return nock(agentUrl)
    .get('/v1/backup/logs')
    .reply(200, logs);
}

function startRestore() {
  return nock(agentUrl)
    .post('/v1/restore/start', body => {
      expect(body.backup).to.be.an('object');
      expect(body.vms).to.be.an.instanceof(Array);
      return true;
    })
    .reply(202, {});
}

function abortRestore() {
  return nock(agentUrl)
    .post('/v1/restore/abort', {})
    .reply(202, {});
}

function lastRestoreOperation(body) {
  return nock(agentUrl)
    .get('/v1/restore')
    .reply(200, body);
}

function getRestoreLogs(logs) {
  return nock(agentUrl)
    .get('/v1/restore/logs')
    .reply(200, logs);
}