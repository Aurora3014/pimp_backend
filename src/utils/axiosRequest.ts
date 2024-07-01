import axios, { Axios, AxiosError } from "axios"
import { seededTokens, tokens, tradeTypeEnum, trades } from "../models/schema";
import { db } from "../models/db";
import { eq } from "drizzle-orm";
import { Address, TonClient, beginCell } from "@ton/ton";


const tonClient = new TonClient({
    endpoint: `https://toncenter.com/api/v2/jsonRPC`,
    apiKey: process.env.CONCENTER_API!
});
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export const getNewTokenDetail = (hash: string) => {
    axios.get(`https://tonapi.io/v2/traces/${hash}`,{headers:{Authorization: 'Bearer '+ process.env.API_KEY!}}) ///////
        .then(async (res: any) => {
            console.log(res.data.children[0].transaction.in_msg.op_code);
            if(res.data.children !== undefined)
                if(res.data.children[0].transaction.in_msg !== undefined)
                    if(res.data.children[0].transaction.in_msg.op_code === '0xfa0614af'){
                        //Hash is new token tx.
                        //should get deployer, timestamp, token address, 
                        const creator = res.data.transaction.account.address;
                        const timestamp = res.data.children[0].transaction.utime;
                        let bondingCurve = ''
                        let address = '';

                        for (const tx of res.data.children[0].children) {
                            if (tx !== undefined) {
                                if (tx.interfaces.length > 0) {
                                    if (tx.interfaces[0] === 'jetton_master') {
                                        address = tx.transaction.account.address;
                                        console.log('=============================================');
                                        console.log(creator, timestamp, address);
                                    }
                                } else {
                                    bondingCurve = tx.transaction.account.address;
                                    console.log(tx.transaction);
                                }
                                
                            }
                        }
                        const value = await getTokenInfo(address);
                        console.log(bondingCurve, '=========================');
                        await db.insert(tokens).values({ ...value, bondingCurve, creator}).catch((err) => console.log(err));

                    }else if(res.data.children[0].transaction.in_msg.op_code === '0xfa0102af'){
                        //Hash is buy/sell tx.
                        //should get user, isBuy, curve address, timestamp, amount
                        const user = res.data.transaction.account.address;
                        const bondingCurve = res.data.children[0].transaction.account.address;
                        const isbuy = true;
                        const amountIn = BigInt( res.data.children[0].transaction.in_msg.value ) - BigInt(100000000);
                        const reserves = await getTokenTradeInfo(bondingCurve);
                        console.log(bondingCurve);
                        const record = await db.select().from(tokens).where(eq(tokens.bondingCurve, bondingCurve));
                        const txNumber = res.data.children[0].children.length;
                        if(txNumber == 5){
                            await db.insert(seededTokens).values({tokenAddress: record[0].address})
                        }
                        let amountOut = BigInt(0);
                        if(isbuy) {
                            amountOut = record[0].tokenReserve! - reserves!.tokenReserve;
                        }
                        try {
                            await db.insert(trades).values({ user, amountIn, amountOut, solReserve: reserves!.solReserve, tokenReserve: reserves!.tokenReserve, usdPerToken: reserves!.usdPerToken, tradeType:isbuy?tradeTypeEnum.enumValues[0]:tradeTypeEnum.enumValues[1], tokenAddress:record[0].address, transactionSignature: hash}).execute()
                            
                        } catch (error) {
                            console.log(error)
                        }
                    }else if(res.data.children[0].transaction.in_msg.op_code === '0x0f8a7ea5'){
                        console.log(res.data.children[0].children[0].transaction.in_msg.op_code);
                        const user = res.data.transaction.account.address;
                        const isbuy = false;
                        const address = res.data.children[0].children[0].transaction.account.address;
                        console.log({user, isbuy})
                        console.log(res.data.children[0].children[0].transaction.in_msg.op_code)
                        const record = await db.select().from(tokens).where(eq(tokens.address, address));

                        let bondingCurve = record[0].bondingCurve;
                        const transactionSignature = hash;
                        if(res.data.children[0].children[0].transaction.in_msg.op_code == '0x00000006'){
                            const amountIn = BigInt(res.data.children[0].transaction.in_msg.decoded_body.amount);
                            console.log({user, amountIn, isbuy})
                            const reserves = await getTokenTradeInfo(bondingCurve);
                            const record = await db.select().from(tokens).where(eq(tokens.address, address));
                            let amountOut = BigInt(0);
                            if(isbuy) {
                                amountOut = reserves!.tokenReserve - record[0].tokenReserve!;
                            }
                                
                            let Dchildren = res.data.children[0].children[0].children[0].children[0];
                            let txCurveAddress = '';
                            if(Dchildren.children[0].interfaces.length === 0){
                                txCurveAddress = Dchildren.children[0].transaction.account.address;
                            } else txCurveAddress = Dchildren.children[1].transaction.account.address;
                            console.log(txCurveAddress, address);
                            if(record.length > 0)
                                if(record[0].bondingCurve == txCurveAddress){
                                    await db.insert(trades).values({user, amountIn, amountOut, solReserve: reserves!.solReserve, tokenReserve: reserves!.tokenReserve, usdPerToken: reserves!.usdPerToken, tradeType:isbuy?'buy':'sell',tokenAddress:address, transactionSignature});
                                }   
                        }
                    }
        }).catch(async (error: AxiosError)=>{
            if(error.response?.status == 429){
                await sleep(1000);
                getNewTokenDetail(hash);
            }
        })
}

export const getTokenInfo = async (address: string) => {
    try {
        console.log('getTokenInfo====\n', address);

        const res = await axios.get(`https://tonapi.io/v2/jettons/${address}`, {headers:{Authorization: 'Bearer '+ process.env.API_KEY!}});
        const data = res.data;
        
        const cid = ( await tonClient.runMethod( Address.parseRaw(address), 
        'get_cid', 
        [])).stack.readString();



        const resJSON = await axios.get(`http://127.0.0.1:8080/ipfs/${cid}`)
        console.log(resJSON.data)
        const value = {
            ...data.metadata,
            address,
            imageUri: data.metadata.image,
            metadataUri: `https://ipfs.io/ipfs/${cid}`,
            marketCap: BigInt(0),
            ...resJSON.data,
        }

        return value;
    } catch (error) {
        console.log(error)    
    }
}

export const getTokenTradeInfo = async (curveAddress: string) => {
    try {
        const solReserve = ( await tonClient.runMethod( Address.parse(curveAddress), 
        'get_reserved_ton', 
        [])).stack.readBigNumber();
        const tokenReserve = ( await tonClient.runMethod( Address.parse(curveAddress), 
        'get_reserved_token', 
        [])).stack.readBigNumber();
        const rate = ( await tonClient.runMethod( Address.parse(curveAddress), 
        'get_reverse_input', 
        [{
            type:'int',
            value: BigInt(1)
        },{
            type:'int',
            value: BigInt(1000000000)
        }])).stack.readBigNumber();
        console.log({
            solReserve,
            tokenReserve,
            usdPerToken:rate
        })
        return {
            solReserve,
            tokenReserve,
            usdPerToken:rate
        }
    } catch (error) {
        console.log(error)
    }
}

