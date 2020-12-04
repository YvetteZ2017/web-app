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
                name: 'FaceAppAPI',
                endpoint: 'https://ytmkle1u45.execute-api.us-east-1.amazonaws.com/prod/inputs',
                region: 'us-west-1'
            }
        ]
    },
    Storage: {
        bucket: '',
        region: 'us-west-1'
    }
};

export default awsConfig;