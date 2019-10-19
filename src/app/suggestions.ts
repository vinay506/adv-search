export default {
    'column': [],
    'arithmeticOperator': [{
        key: 'like',
        displayName: 'like',
        allowedTo: ['text', 'number'],
        type: 'arithmeticOperator'
    }, {
        key: 'N_Lk',
        displayName: 'Not Like',
        allowedTo: ['text', 'number'],
        type: 'arithmeticOperator'
    }, {
        key: 'NOT',
        displayName: 'Not',
        allowedTo: ['text', 'number', 'between', 'timestamp'],
        type: 'arithmeticOperator'
    }, {
        key: '=',
        displayName: '=',
        allowedTo: ['text', 'number', 'between', 'timestamp'],
        type: 'arithmeticOperator'
    }, {
        key: '!=',
        displayName: '!=',
        allowedTo: ['text', 'number', 'between', 'timestamp'],
        type: 'arithmeticOperator'
    },
    {
        key: '<',
        displayName: '<',
        allowedTo: ['number', 'between', 'timestamp'],
        type: 'arithmeticOperator'
    },
    {
        key: '>',
        displayName: '>',
        allowedTo: ['number', 'between', 'timestamp'],
        type: 'arithmeticOperator'
    },
    {
        key: '<=',
        displayName: '<=',
        allowedTo: ['number', 'between', 'timestamp'],
        type: 'arithmeticOperator'
    },
    {
        key: '>=',
        displayName: '>=',
        allowedTo: ['number', 'between', 'timestamp'],
        type: 'arithmeticOperator'
    },
    {
        key: 'between',
        displayName: 'Between',
        allowedTo: ['between', 'timestamp'],
        type: 'arithmeticOperator'
    },
    {
        key: 'NT_bw',
        displayName: 'Not Between',
        allowedTo: ['between', 'timestamp'],
        type: 'arithmeticOperator'
    },
    {
        key: 'IN',
        displayName: 'In',
        allowedTo: ['dropdown'],
        type: 'arithmeticOperator'
    },
    {
        key: 'N_I',
        displayName: 'Not In',
        allowedTo: ['dropdown'],
        type: 'arithmeticOperator'
    }


    ],
    'logicalOperator': [{
        key: ')',
        typeOfParanthesis: 'end',
        displayName: ')',
        type: 'paranthesis'
    }, {
        key: '&&',
        displayName: 'AND',
        type: 'logicalOperator'
    }, {
        key: '||',
        displayName: 'OR',
        type: 'logicalOperator'
    }]
}
