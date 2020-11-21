const awsConfig = {
    Auth: {
        identityPoolId: 'us-east-1:c3169f7c-5010-4fc3-9800-038228d9c791',
        region: 'us-west-1',
        userPoolId: 'us-east-1_eD6kxYwdt',
        userPoolWebClientId: '470kd1l40n2imipef3tuq96u01'
    },
    API: {
        endpoints: [
            {
                name: 'WildRydesAPI',
                endpoint: '', // example: 'https://u8swuvl00f.execute-api.us-east-2.amazonaws.com/prod'
                region: 'us-west-1' // example: 'us-east-2'
            }
        ]
    },
    Storage: {
        bucket: '', //example: 'wildrydesbackend-profilepicturesbucket-1wgssc97ekdph'
        region: 'us-west-1' // example: 'us-east-2'
    }
};

export default awsConfig;