const Constants = {
    frontEndBaseUrl: 'http://localhost:3000',
    frontEndAddr: 'http://10.177.44.113',
    formHeader: {headers: {'Content-Type': 'application/json'}},
    proxy: '/b',
    login: '/api/user/login',
    logout: '/api/user/logout',
    register: '/api/user/register',
    info: '/api/user/info',
    auth: '/api/applyTaggerAuth',
    dataset: '/api/dataset',
    datasets: '/api/datasets',
    authorized_datasets: '/api/authorized_datasets',
    samples: '/api/samples',
    sample: '/api/sample', // text type sample
    sample_upload: '/api/sample/upload', // image or audio type sample
    tag: '/api/tag', // if delete, Usage: DELETE, '/api/tag/{tag_id}'; if update, Usage: POST, '/api/tag/{tag_id}'
    tags: '/api/tags',
    sample_join_tags: '/api/sample/tag', //Get, Usage: '/api/sample/tag/{sample_id}', get all tags belong to the sample
}

export default Constants;