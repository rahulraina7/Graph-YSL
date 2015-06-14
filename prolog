rules_str = """
net_worth :-
    and(
        token('net'),
        token('worth'),
        or(
            topic('Banking'),
            topic('Banks'),
            topic('Financial institutions'),
            topic('Financial services'),
            topic('Finance')
        )
    ).


credit_accounts :-
    and(
        token('credit'),
        or(
            topic('Credit cards'),
            topic('Payment cards'),
        ),
        entity_freebase_type('/business/business_operation')
    ).

bank_accounts :- 
    and(
        token('bank'),
        or(
            topic('Banking'),
            topic('Payment cards'),
        ),
        entity_freebase_type('/business/business_operation')
    ).

investment_accounts :- 
    and(
        stem('invest'),
        or(
            topic('Finance'),
            topic('Banking'),
            topic('Investment')
        ),
        entity_freebase_type('/business/business_operation')
    ).

insurance_accounts :- 
    and(
        stem('insur'),
        or(
            topic('Finance'),
            topic('Banking'),
            topic('Banks'),
            topic('Financial institutions'),
            topic('Investment')
        ),
        entity_freebase_type('/business/business_operation')
    ).

transactions :- 
    or(
        stem('transact'),
        entity_freebase_type('/organization/organization')
    ).  
"""