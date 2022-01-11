import * as React from 'react'
import { CloseEventSource, HandleError } from '../util'
const {EventSourcePolyfill} = require('event-source-polyfill')
const fetch = require('isomorphic-fetch')


/*
    useEvents is a react hook which returns details
    takes:
      - url to direktiv api http://x/api/
      - stream to use sse or a normal fetch
      - namespace the namespace to send the requests to
      - apikey to provide authentication of an apikey
*/
export const useDirektivEvents = (url, stream, namespace, apikey) => {
    const [data, setData] = React.useState(null)
    const [err, setErr] = React.useState(null)
    const [eventSource, setEventSource] = React.useState(null)

    React.useEffect(()=>{
        if(stream) {
            if (eventSource === null){
                // setup event listener 
                let listener = new EventSourcePolyfill(`${url}namespaces/${namespace}/events`, {
                    headers: apikey === undefined ? {}:{"apikey": apikey}
                })

                listener.onerror = (e) => {
                    if(e.status === 403) {
                        setErr("permission denied")
                    }
                }

                async function readData(e) {
                    if(e.data === "") {
                        return
                    }
                    let json = JSON.parse(e.data)
                    setData(json.edges)
                }

                listener.onmessage = e => readData(e)
                setEventSource(listener)
            }
        } else {
            if(data === null) {
                getEventListeners()
            }
        }
    },[data])

    React.useEffect(()=>{
        return () => CloseEventSource(eventSource)
    },[eventSource])

    async function getEventListeners(){
        try {
            let resp = await fetch(`${url}namespaces/${namespace}/events`,{
                method: "GET",
                headers: apikey === undefined ? {}:{"apikey": apikey}
            })
            if(!resp.ok){
                return await HandleError('get event listeners', resp, 'listEventListeners')
            }
        } catch(e){
            return e.message
        }
    }

    async function sendEvent(event){
        let headers = {
            "content-type": "application/cloudevents+json; charset=UTF-8"
        }
        if(apikey !== undefined) {
            apikey["apikey"] = apikey
        }

        try {
            let resp = await fetch(`${url}namespaces/${namespace}/broadcast`,{
                method: "POST",
                body: event,
                headers: headers
            })
            if(!resp.ok) {
                return await HandleError('send namespace event', resp, "sendNamespaceEvent")
            }
        } catch(e) {
            return e.message
        }
    }

    return {
        data,
        err,
        getEventListeners,
        sendEvent
    }
}
