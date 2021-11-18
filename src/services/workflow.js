import * as React from 'react'
import fetch from "cross-fetch"
import { CloseEventSource, HandleError } from '../util'
const {EventSourcePolyfill} = require('event-source-polyfill')


/*
    useWorkflowServices is a react hook 
    takes:
      - url to direktiv api http://x/api/
      - stream to use sse or a normal fetch
      - namespace to use for the api
      - path to use for the api of the workflow
      - apikey to provide authentication of an apikey
*/
export const useDirektivWorkflowServices = (url, stream, namespace, path, apikey)=>{
    const [data, setData] = React.useState(null)
    const functionsRef = React.useRef(data ? data: [])
    const [err, setErr] = React.useState(null)
    const [eventSource, setEventSource] = React.useState(null)


    React.useEffect(()=>{
        if(stream) {
            if (eventSource === null){
                // setup event listener 
                let listener = new EventSourcePolyfill(`${url}functions/namespaces/${namespace}/tree/${path}?op=services`, {
                    headers: apikey === undefined ? {}:{"apikey": apikey}
                })

                listener.onerror = (e) => {
                    if(e.status === 403) {
                        setErr("permission denied")
                    }
                }

                async function readData(e) {
                    let funcs = functionsRef.current
                    if(e.data === "") {
                        return
                    }
                    let json = JSON.parse(e.data)
                    switch (json.event) {
                    case "DELETED":
                        for (var i=0; i < funcs.length; i++) {
                            if(funcs[i].serviceName === json.function.serviceName) {
                                funcs.splice(i, 1)
                                functionsRef.current = funcs
                                break
                            }
                        }
                        break
                    case "MODIFIED":
                        for(i=0; i < funcs.length; i++) {
                            if (funcs[i].serviceName === json.function.serviceName) {
                                funcs[i] = json.function
                                functionsRef.current = funcs
                                break
                            }
                        }
                        break
                    default:
                        let found = false
                        for(i=0; i < funcs.length; i++) {
                            if(funcs[i].serviceName === json.function.serviceName) {
                                found = true 
                                break
                            }
                        }
                        if (!found){
                            funcs.push(json.function)
                            functionsRef.current = funcs
                        }
                    }
                    setData(JSON.parse(JSON.stringify(functionsRef.current)))
                }

                listener.onmessage = e => readData(e)
                setEventSource(listener)
            }
        } else {
            if(data === null) {
                getWorkflowServices()
            }
        }
    },[data])

    React.useEffect(()=>{
        return () => CloseEventSource(eventSource)
    },[eventSource])


    async function getWorkflowServices() {
        try {
            let resp = await fetch(`${url}functions/namespaces/${namespace}/tree/${path}?op=services`, {
                headers: apikey === undefined ? {}:{"apikey": apikey},
                method: "GET"
            })
            if (resp.ok) {
                let json = await resp.json()
                setData(json)
            } else {
                setErr(await HandleError('get workflow services', resp, 'listServices'))
            }
        } catch(e){
            setErr(e.message)
        }
    }

    return {
        data,
        err,
        getWorkflowServices
    }
}