import * as React from 'react'
import { HandleError, ExtractQueryString } from '../util'
const fetch = require('isomorphic-fetch')

/*
    useBroadcastConfiguration is a react hook
    takes:
      - url to direktiv api http://x/api/
      - namespace the namespace to send the requests to
      - apikey to provide authentication of an apikey
*/
export const useDirektivBroadcastConfiguration = (url, namespace, apikey) => {
    const [data, setData] = React.useState(null)

    React.useEffect(() => {
        if (data === null) {
            getBroadcastConfiguration()
        }
    }, [data])

    async function getBroadcastConfiguration(...queryParameters) {
        let resp = await fetch(`${url}namespaces/${namespace}/config${ExtractQueryString(false, ...queryParameters)}`, {
            headers: apikey === undefined ? {} : { "apikey": apikey }
        })
        if (!resp.ok) {
            throw new Error(await HandleError('fetch config', resp, 'getNamespaceConfiguration'))
        }
        let json = await resp.json()
        setData(json)
        return json
    }

    async function setBroadcastConfiguration(newconfig, ...queryParameters) {
        let resp = await fetch(`${url}namespaces/${namespace}/config${ExtractQueryString(false, ...queryParameters)}`, {
            method: "PATCH",
            body: newconfig,
            headers: apikey === undefined ? {} : { "apikey": apikey }
        })
        if (!resp.ok) {
            throw new Error(await HandleError('set config', resp, 'setNamespaceConfiguration'))
        }
        return await resp.json()
    }

    return {
        data,
        getBroadcastConfiguration,
        setBroadcastConfiguration
    }
}