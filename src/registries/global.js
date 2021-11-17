import * as React from 'react'
import fetch from "cross-fetch"
import {  HandleError } from '../util'

/*
    useGlobalRegistries is a react hook which returns create registry, delete registry and data
    takes:
      - url to direktiv api http://x/api/
      - apikey to provide authentication of an apikey
*/
export const useDirektivGlobalRegistries = (url, apikey) => {

    const [data, setData] = React.useState(null)
    const [err, setErr] = React.useState(null)

    React.useEffect(()=>{
        if(data === null) {
            getRegistries()
        }
    },[data])

    // getGlobalRegistries returns a list of registries
    async function getRegistries() {
        try {
            let resp = await fetch(`${url}functions/registries/global`, {
                headers: apikey === undefined ? {}:{"apikey": apikey}
            })
            if (resp.ok) {
                let json = await resp.json()
                setData(json.registries)
            } else {
                setErr(await HandleError('list registries', resp, 'listGlobalRegistries'))
            }
        } catch(e) {
            setErr(e.message)
        }
    }

    async function createRegistry(key, val){
        try {
            let resp = await fetch(`${url}functions/registries/global`, {
                method: "POST",
                body: JSON.stringify({data:val, reg: key})
            })
            if(!resp.ok){
                setErr(await HandleError('create registry', resp, 'createRegistry'))
            }
        } catch(e) {
            setErr(e.message)
        }
    }

    async function deleteRegistry(key){
        try {
            let resp = await fetch(`${url}functions/registries/global`, {
                method: "DELETE",
                body: JSON.stringify({
                    reg: key
                })
            })
            if (!resp.ok) {
                setErr(await HandleError('delete registry', resp, 'deleteRegistry'))
            }
        } catch (e) {
            setErr(e.message)
        }
    }

    return {
        data,
        err,
        createRegistry,
        deleteRegistry,
        getRegistries
    }
}