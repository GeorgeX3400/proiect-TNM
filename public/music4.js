
        
                const i32 = (v) => v
                const f32 = i32
                const f64 = i32
                
function toInt(v) {
                    return v
                }
function toFloat(v) {
                    return v
                }
function createFloatArray(length) {
                    return new Float64Array(length)
                }
function setFloatDataView(dataView, position, value) {
                    dataView.setFloat64(position, value)
                }
function getFloatDataView(dataView, position) {
                    return dataView.getFloat64(position)
                }
let IT_FRAME = 0
let FRAME = 0
let BLOCK_SIZE = 0
let SAMPLE_RATE = 0
let NULL_SIGNAL = 0
let INPUT = createFloatArray(0)
let OUTPUT = createFloatArray(0)
const G_sked_ID_NULL = -1
const G_sked__ID_COUNTER_INIT = 1
const G_sked__MODE_WAIT = 0
const G_sked__MODE_SUBSCRIBE = 1


function G_sked_create(isLoggingEvents) {
                return {
                    eventLog: new Set(),
                    events: new Map(),
                    requests: new Map(),
                    idCounter: G_sked__ID_COUNTER_INIT,
                    isLoggingEvents,
                }
            }
function G_sked_wait(skeduler, event, callback) {
                if (skeduler.isLoggingEvents === false) {
                    throw new Error("Please activate skeduler's isLoggingEvents")
                }

                if (skeduler.eventLog.has(event)) {
                    callback(event)
                    return G_sked_ID_NULL
                } else {
                    return G_sked__createRequest(skeduler, event, callback, G_sked__MODE_WAIT)
                }
            }
function G_sked_waitFuture(skeduler, event, callback) {
                return G_sked__createRequest(skeduler, event, callback, G_sked__MODE_WAIT)
            }
function G_sked_subscribe(skeduler, event, callback) {
                return G_sked__createRequest(skeduler, event, callback, G_sked__MODE_SUBSCRIBE)
            }
function G_sked_emit(skeduler, event) {
                if (skeduler.isLoggingEvents === true) {
                    skeduler.eventLog.add(event)
                }
                if (skeduler.events.has(event)) {
                    const skedIds = skeduler.events.get(event)
                    const skedIdsStaying = []
                    for (let i = 0; i < skedIds.length; i++) {
                        if (skeduler.requests.has(skedIds[i])) {
                            const request = skeduler.requests.get(skedIds[i])
                            request.callback(event)
                            if (request.mode === G_sked__MODE_WAIT) {
                                skeduler.requests.delete(request.id)
                            } else {
                                skedIdsStaying.push(request.id)
                            }
                        }
                    }
                    skeduler.events.set(event, skedIdsStaying)
                }
            }
function G_sked_cancel(skeduler, id) {
                skeduler.requests.delete(id)
            }
function G_sked__createRequest(skeduler, event, callback, mode) {
                const id = G_sked__nextId(skeduler)
                const request = {
                    id, 
                    mode, 
                    callback,
                }
                skeduler.requests.set(id, request)
                if (!skeduler.events.has(event)) {
                    skeduler.events.set(event, [id])    
                } else {
                    skeduler.events.get(event).push(id)
                }
                return id
            }
function G_sked__nextId(skeduler) {
                return skeduler.idCounter++
            }
const G_commons__ARRAYS = new Map()
const G_commons__ARRAYS_SKEDULER = G_sked_create(false)
function G_commons_getArray(arrayName) {
            if (!G_commons__ARRAYS.has(arrayName)) {
                throw new Error('Unknown array ' + arrayName)
            }
            return G_commons__ARRAYS.get(arrayName)
        }
function G_commons_hasArray(arrayName) {
            return G_commons__ARRAYS.has(arrayName)
        }
function G_commons_setArray(arrayName, array) {
            G_commons__ARRAYS.set(arrayName, array)
            G_sked_emit(G_commons__ARRAYS_SKEDULER, arrayName)
        }
function G_commons_subscribeArrayChanges(arrayName, callback) {
            const id = G_sked_subscribe(G_commons__ARRAYS_SKEDULER, arrayName, callback)
            if (G_commons__ARRAYS.has(arrayName)) {
                callback(arrayName)
            }
            return id
        }
function G_commons_cancelArrayChangesSubscription(id) {
            G_sked_cancel(G_commons__ARRAYS_SKEDULER, id)
        }

const G_commons__FRAME_SKEDULER = G_sked_create(false)
function G_commons__emitFrame(frame) {
            G_sked_emit(G_commons__FRAME_SKEDULER, frame.toString())
        }
function G_commons_waitFrame(frame, callback) {
            return G_sked_waitFuture(G_commons__FRAME_SKEDULER, frame.toString(), callback)
        }
function G_commons_cancelWaitFrame(id) {
            G_sked_cancel(G_commons__FRAME_SKEDULER, id)
        }
const G_msg_FLOAT_TOKEN = "number"
const G_msg_STRING_TOKEN = "string"
function G_msg_create(template) {
                    const m = []
                    let i = 0
                    while (i < template.length) {
                        if (template[i] === G_msg_STRING_TOKEN) {
                            m.push('')
                            i += 2
                        } else if (template[i] === G_msg_FLOAT_TOKEN) {
                            m.push(0)
                            i += 1
                        }
                    }
                    return m
                }
function G_msg_getLength(message) {
                    return message.length
                }
function G_msg_getTokenType(message, tokenIndex) {
                    return typeof message[tokenIndex]
                }
function G_msg_isStringToken(message, tokenIndex) {
                    return G_msg_getTokenType(message, tokenIndex) === 'string'
                }
function G_msg_isFloatToken(message, tokenIndex) {
                    return G_msg_getTokenType(message, tokenIndex) === 'number'
                }
function G_msg_isMatching(message, tokenTypes) {
                    return (message.length === tokenTypes.length) 
                        && message.every((v, i) => G_msg_getTokenType(message, i) === tokenTypes[i])
                }
function G_msg_writeFloatToken(message, tokenIndex, value) {
                    message[tokenIndex] = value
                }
function G_msg_writeStringToken(message, tokenIndex, value) {
                    message[tokenIndex] = value
                }
function G_msg_readFloatToken(message, tokenIndex) {
                    return message[tokenIndex]
                }
function G_msg_readStringToken(message, tokenIndex) {
                    return message[tokenIndex]
                }
function G_msg_floats(values) {
                    return values
                }
function G_msg_strings(values) {
                    return values
                }
function G_msg_display(message) {
                    return '[' + message
                        .map(t => typeof t === 'string' ? '"' + t + '"' : t.toString())
                        .join(', ') + ']'
                }
function G_msg_VOID_MESSAGE_RECEIVER(m) {}
let G_msg_EMPTY_MESSAGE = G_msg_create([])
function G_bangUtils_isBang(message) {
            return (
                G_msg_isStringToken(message, 0) 
                && G_msg_readStringToken(message, 0) === 'bang'
            )
        }
function G_bangUtils_bang() {
            const message = G_msg_create([G_msg_STRING_TOKEN, 4])
            G_msg_writeStringToken(message, 0, 'bang')
            return message
        }
function G_bangUtils_emptyToBang(message) {
            if (G_msg_getLength(message) === 0) {
                return G_bangUtils_bang()
            } else {
                return message
            }
        }
const G_msgBuses__BUSES = new Map()
function G_msgBuses_publish(busName, message) {
            let i = 0
            const callbacks = G_msgBuses__BUSES.has(busName) ? G_msgBuses__BUSES.get(busName): []
            for (i = 0; i < callbacks.length; i++) {
                callbacks[i](message)
            }
        }
function G_msgBuses_subscribe(busName, callback) {
            if (!G_msgBuses__BUSES.has(busName)) {
                G_msgBuses__BUSES.set(busName, [])
            }
            G_msgBuses__BUSES.get(busName).push(callback)
        }
function G_msgBuses_unsubscribe(busName, callback) {
            if (!G_msgBuses__BUSES.has(busName)) {
                return
            }
            const callbacks = G_msgBuses__BUSES.get(busName)
            const found = callbacks.indexOf(callback)
            if (found !== -1) {
                callbacks.splice(found, 1)
            }
        }
function computeUnitInSamples(sampleRate, amount, unit) {
        if (unit.slice(0, 3) === 'per') {
            if (amount !== 0) {
                amount = 1 / amount
            }
            unit = unit.slice(3)
        }

        if (unit === 'msec' || unit === 'milliseconds' || unit === 'millisecond') {
            return amount / 1000 * sampleRate
        } else if (unit === 'sec' || unit === 'seconds' || unit === 'second') {
            return amount * sampleRate
        } else if (unit === 'min' || unit === 'minutes' || unit === 'minute') {
            return amount * 60 * sampleRate
        } else if (unit === 'samp' || unit === 'samples' || unit === 'sample') {
            return amount
        } else {
            throw new Error("invalid time unit : " + unit)
        }
    }
function G_actionUtils_isAction(message, action) {
            return G_msg_isMatching(message, [G_msg_STRING_TOKEN])
                && G_msg_readStringToken(message, 0) === action
        }
function G_msgUtils_slice(message, start, end) {
            if (G_msg_getLength(message) <= start) {
                throw new Error('message empty')
            }
            const template = G_msgUtils__copyTemplate(message, start, end)
            const newMessage = G_msg_create(template)
            G_msgUtils_copy(message, newMessage, start, end, 0)
            return newMessage
        }
function G_msgUtils_concat(message1, message2) {
            const newMessage = G_msg_create(G_msgUtils__copyTemplate(message1, 0, G_msg_getLength(message1)).concat(G_msgUtils__copyTemplate(message2, 0, G_msg_getLength(message2))))
            G_msgUtils_copy(message1, newMessage, 0, G_msg_getLength(message1), 0)
            G_msgUtils_copy(message2, newMessage, 0, G_msg_getLength(message2), G_msg_getLength(message1))
            return newMessage
        }
function G_msgUtils_shift(message) {
            switch (G_msg_getLength(message)) {
                case 0:
                    throw new Error('message empty')
                case 1:
                    return G_msg_create([])
                default:
                    return G_msgUtils_slice(message, 1, G_msg_getLength(message))
            }
        }
function G_msgUtils_copy(src, dest, srcStart, srcEnd, destStart) {
            let i = srcStart
            let j = destStart
            for (i, j; i < srcEnd; i++, j++) {
                if (G_msg_getTokenType(src, i) === G_msg_STRING_TOKEN) {
                    G_msg_writeStringToken(dest, j, G_msg_readStringToken(src, i))
                } else {
                    G_msg_writeFloatToken(dest, j, G_msg_readFloatToken(src, i))
                }
            }
        }
function G_msgUtils__copyTemplate(src, start, end) {
            const template = []
            for (let i = start; i < end; i++) {
                const tokenType = G_msg_getTokenType(src, i)
                template.push(tokenType)
                if (tokenType === G_msg_STRING_TOKEN) {
                    template.push(G_msg_readStringToken(src, i).length)
                }
            }
            return template
        }
function G_tokenConversion_toFloat(m, i) {
        if (G_msg_isFloatToken(m, i)) {
            return G_msg_readFloatToken(m, i)
        } else {
            return 0
        }
    }
function G_tokenConversion_toString_(m, i) {
        if (G_msg_isStringToken(m, i)) {
            const str = G_msg_readStringToken(m, i)
            if (str === 'bang') {
                return 'symbol'
            } else {
                return str
            }
        } else {
            return 'float'
        }
    }

function G_points_interpolateLin(x, p0, p1) {
        return p0.y + (x - p0.x) * (p1.y - p0.y) / (p1.x - p0.x)
    }

function G_linesUtils_computeSlope(p0, p1) {
            return p1.x !== p0.x ? (p1.y - p0.y) / (p1.x - p0.x) : 0
        }
function G_linesUtils_removePointsBeforeFrame(points, frame) {
            const newPoints = []
            let i = 0
            while (i < points.length) {
                if (frame <= points[i].x) {
                    newPoints.push(points[i])
                }
                i++
            }
            return newPoints
        }
function G_linesUtils_insertNewLinePoints(points, p0, p1) {
            const newPoints = []
            let i = 0
            
            // Keep the points that are before the new points added
            while (i < points.length && points[i].x <= p0.x) {
                newPoints.push(points[i])
                i++
            }
            
            // Find the start value of the start point :
            
            // 1. If there is a previous point and that previous point
            // is on the same frame, we don't modify the start point value.
            // (represents a vertical line).
            if (0 < i - 1 && points[i - 1].x === p0.x) {

            // 2. If new points are inserted in between already existing points 
            // we need to interpolate the existing line to find the startValue.
            } else if (0 < i && i < points.length) {
                newPoints.push({
                    x: p0.x,
                    y: G_points_interpolateLin(p0.x, points[i - 1], points[i])
                })

            // 3. If new line is inserted after all existing points, 
            // we just take the value of the last point
            } else if (i >= points.length && points.length) {
                newPoints.push({
                    x: p0.x,
                    y: points[points.length - 1].y,
                })

            // 4. If new line placed in first position, we take the defaultStartValue.
            } else if (i === 0) {
                newPoints.push({
                    x: p0.x,
                    y: p0.y,
                })
            }
            
            newPoints.push({
                x: p1.x,
                y: p1.y,
            })
            return newPoints
        }
function G_linesUtils_computeFrameAjustedPoints(points) {
            if (points.length < 2) {
                throw new Error('invalid length for points')
            }

            const newPoints = []
            let i = 0
            let p = points[0]
            let frameLower = 0
            let frameUpper = 0
            
            while(i < points.length) {
                p = points[i]
                frameLower = Math.floor(p.x)
                frameUpper = frameLower + 1

                // I. Placing interpolated point at the lower bound of the current frame
                // ------------------------------------------------------------------------
                // 1. Point is already on an exact frame,
                if (p.x === frameLower) {
                    newPoints.push({ x: p.x, y: p.y })

                    // 1.a. if several of the next points are also on the same X,
                    // we find the last one to draw a vertical line.
                    while (
                        (i + 1) < points.length
                        && points[i + 1].x === frameLower
                    ) {
                        i++
                    }
                    if (points[i].y !== newPoints[newPoints.length - 1].y) {
                        newPoints.push({ x: points[i].x, y: points[i].y })
                    }

                    // 1.b. if last point, we quit
                    if (i + 1 >= points.length) {
                        break
                    }

                    // 1.c. if next point is in a different frame we can move on to next iteration
                    if (frameUpper <= points[i + 1].x) {
                        i++
                        continue
                    }
                
                // 2. Point isn't on an exact frame
                // 2.a. There's a previous point, the we use it to interpolate the value.
                } else if (newPoints.length) {
                    newPoints.push({
                        x: frameLower,
                        y: G_points_interpolateLin(frameLower, points[i - 1], p),
                    })
                
                // 2.b. It's the very first point, then we don't change its value.
                } else {
                    newPoints.push({ x: frameLower, y: p.y })
                }

                // II. Placing interpolated point at the upper bound of the current frame
                // ---------------------------------------------------------------------------
                // First, we find the closest point from the frame upper bound (could be the same p).
                // Or could be a point that is exactly placed on frameUpper.
                while (
                    (i + 1) < points.length 
                    && (
                        Math.ceil(points[i + 1].x) === frameUpper
                        || Math.floor(points[i + 1].x) === frameUpper
                    )
                ) {
                    i++
                }
                p = points[i]

                // 1. If the next point is directly in the next frame, 
                // we do nothing, as this corresponds with next iteration frameLower.
                if (Math.floor(p.x) === frameUpper) {
                    continue
                
                // 2. If there's still a point after p, we use it to interpolate the value
                } else if (i < points.length - 1) {
                    newPoints.push({
                        x: frameUpper,
                        y: G_points_interpolateLin(frameUpper, p, points[i + 1]),
                    })

                // 3. If it's the last point, we dont change the value
                } else {
                    newPoints.push({ x: frameUpper, y: p.y })
                }

                i++
            }

            return newPoints
        }
function G_linesUtils_computeLineSegments(points) {
            const lineSegments = []
            let i = 0
            let p0
            let p1

            while(i < points.length - 1) {
                p0 = points[i]
                p1 = points[i + 1]
                lineSegments.push({
                    p0, p1, 
                    dy: G_linesUtils_computeSlope(p0, p1),
                    dx: 1,
                })
                i++
            }
            return lineSegments
        }
function G_funcs_mtof(value) {
        return value <= -1500 ? 0: (value > 1499 ? 3.282417553401589e+38 : Math.pow(2, (value - 69) / 12) * 440)
    }
        
function NT_tgl_setReceiveBusName(state, busName) {
            if (state.receiveBusName !== "empty") {
                G_msgBuses_unsubscribe(state.receiveBusName, state.messageReceiver)
            }
            state.receiveBusName = busName
            if (state.receiveBusName !== "empty") {
                G_msgBuses_subscribe(state.receiveBusName, state.messageReceiver)
            }
        }
function NT_tgl_setSendReceiveFromMessage(state, m) {
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'receive'
            ) {
                NT_tgl_setReceiveBusName(state, G_msg_readStringToken(m, 1))
                return true

            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'send'
            ) {
                state.sendBusName = G_msg_readStringToken(m, 1)
                return true
            }
            return false
        }
function NT_tgl_defaultMessageHandler(m) {}
function NT_tgl_receiveMessage(state, m) {
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        state.valueFloat = G_msg_readFloatToken(m, 0)
                        const outMessage = G_msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            G_msgBuses_publish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (G_bangUtils_isBang(m)) {
                        state.valueFloat = state.valueFloat === 0 ? state.maxValue: 0
                        const outMessage = G_msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            G_msgBuses_publish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (
                        G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN]) 
                        && G_msg_readStringToken(m, 0) === 'set'
                    ) {
                        state.valueFloat = G_msg_readFloatToken(m, 1)
                        return
                    
                    } else if (NT_tgl_setSendReceiveFromMessage(state, m) === true) {
                        return
                    }
                }



function NT_metro_setRate(state, rate) {
                state.rate = Math.max(rate, 0)
            }
function NT_metro_scheduleNextTick(state) {
                state.snd0(G_bangUtils_bang())
                state.realNextTick = state.realNextTick + state.rate * state.sampleRatio
                state.skedId = G_commons_waitFrame(
                    toInt(Math.round(state.realNextTick)), 
                    state.tickCallback,
                )
            }
function NT_metro_stop(state) {
                if (state.skedId !== G_sked_ID_NULL) {
                    G_commons_cancelWaitFrame(state.skedId)
                    state.skedId = G_sked_ID_NULL
                }
                state.realNextTick = 0
            }

function NT_float_setValue(state, value) {
                state.value = value
            }

function NT_add_setLeft(state, value) {
                    state.leftOp = value
                }
function NT_add_setRight(state, value) {
                    state.rightOp = value
                }

function NT_mod_setLeft(state, value) {
                    state.leftOp = value > 0 ? Math.floor(value): Math.ceil(value)
                }
function NT_mod_setRight(state, value) {
                    state.rightOp = Math.floor(Math.abs(value))
                }







const NT_line_t_defaultLine = {
                p0: {x: -1, y: 0},
                p1: {x: -1, y: 0},
                dx: 1,
                dy: 0,
            }
function NT_line_t_setNewLine(state, targetValue) {
                const startFrame = toFloat(FRAME)
                const endFrame = toFloat(FRAME) + state.nextDurationSamp
                if (endFrame === toFloat(FRAME)) {
                    state.currentLine = NT_line_t_defaultLine
                    state.currentValue = targetValue
                    state.nextDurationSamp = 0
                } else {
                    state.currentLine = {
                        p0: {
                            x: startFrame, 
                            y: state.currentValue,
                        }, 
                        p1: {
                            x: endFrame, 
                            y: targetValue,
                        }, 
                        dx: 1,
                        dy: 0,
                    }
                    state.currentLine.dy = G_linesUtils_computeSlope(state.currentLine.p0, state.currentLine.p1)
                    state.nextDurationSamp = 0
                }
            }
function NT_line_t_setNextDuration(state, durationMsec) {
                state.nextDurationSamp = computeUnitInSamples(SAMPLE_RATE, durationMsec, 'msec')
            }
function NT_line_t_stop(state) {
                state.currentLine.p1.x = -1
                state.currentLine.p1.y = state.currentValue
            }



function NT_delay_setDelay(state, delay) {
                state.delay = Math.max(0, delay)
            }
function NT_delay_scheduleDelay(state, callback, currentFrame) {
                if (state.scheduledBang !== G_sked_ID_NULL) {
                    NT_delay_stop(state)
                }
                state.scheduledBang = G_commons_waitFrame(toInt(
                    Math.round(
                        toFloat(currentFrame) + state.delay * state.sampleRatio)),
                    callback
                )
            }
function NT_delay_stop(state) {
                G_commons_cancelWaitFrame(state.scheduledBang)
                state.scheduledBang = G_sked_ID_NULL
            }









function NT_osc_t_setStep(state, freq) {
                    state.step = (2 * Math.PI / SAMPLE_RATE) * freq
                }
function NT_osc_t_setPhase(state, phase) {
                    state.phase = phase % 1.0 * 2 * Math.PI
                }



function NT_lop_t_setFreq(state, freq) {
                state.coeff = Math.max(Math.min(freq * 2 * Math.PI / SAMPLE_RATE, 1), 0)
            }





        const N_n_0_0_state = {
                                minValue: 0,
maxValue: 1,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "empty",
messageReceiver: NT_tgl_defaultMessageHandler,
messageSender: NT_tgl_defaultMessageHandler,
                            }
const N_n_0_34_state = {
                                currentValue: 0,
                            }
const N_n_0_42_state = {
                                rate: 0,
sampleRatio: 1,
skedId: G_sked_ID_NULL,
realNextTick: -1,
snd0: function (m) {},
tickCallback: function () {},
                            }
const N_n_0_1_state = {
                                value: 0,
                            }
const N_n_0_2_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_0_3_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_0_4_state = {
                                floatFilter: 0,
stringFilter: "0",
filterType: G_msg_FLOAT_TOKEN,
                            }
const N_n_0_5_state = {
                                msgSpecs: [],
                            }
const N_n_0_24_state = {
                                msgSpecs: [],
                            }
const N_n_0_27_state = {
                                currentLine: NT_line_t_defaultLine,
currentValue: 0,
nextDurationSamp: 0,
                            }
const N_n_0_25_state = {
                                delay: 0,
sampleRatio: 1,
scheduledBang: G_sked_ID_NULL,
                            }
const N_n_0_26_state = {
                                msgSpecs: [],
                            }
const N_m_n_0_23_0_sig_state = {
                                currentValue: 0,
                            }
const N_n_0_6_state = {
                                msgSpecs: [],
                            }
const N_n_0_7_state = {
                                msgSpecs: [],
                            }
const N_n_0_8_state = {
                                msgSpecs: [],
                            }
const N_n_0_9_state = {
                                msgSpecs: [],
                            }
const N_n_0_10_state = {
                                msgSpecs: [],
                            }
const N_n_0_11_state = {
                                msgSpecs: [],
                            }
const N_n_0_12_state = {
                                msgSpecs: [],
                            }
const N_n_0_13_state = {
                                msgSpecs: [],
                            }
const N_n_0_14_state = {
                                msgSpecs: [],
                            }
const N_n_0_15_state = {
                                msgSpecs: [],
                            }
const N_n_0_16_state = {
                                msgSpecs: [],
                            }
const N_n_0_17_state = {
                                msgSpecs: [],
                            }
const N_n_0_18_state = {
                                msgSpecs: [],
                            }
const N_n_0_19_state = {
                                msgSpecs: [],
                            }
const N_n_0_20_state = {
                                msgSpecs: [],
                            }
const N_n_0_32_state = {
                                msgSpecs: [],
                            }
const N_n_0_33_state = {
                                msgSpecs: [],
                            }
const N_n_0_23_state = {
                                phase: 0,
step: 0,
                            }
const N_m_n_0_29_1_sig_state = {
                                currentValue: 0.1,
                            }
const N_m_n_0_40_0_sig_state = {
                                currentValue: 140,
                            }
const N_n_0_40_state = {
                                phase: 0,
step: 0,
                            }
const N_m_n_0_35_1_sig_state = {
                                currentValue: 5,
                            }
const N_n_0_35_state = {
                                previous: 0,
coeff: 0,
                            }
const N_m_n_0_38_1_sig_state = {
                                currentValue: 0.15,
                            }
const N_m_n_0_41_0_sig_state = {
                                currentValue: 160,
                            }
const N_n_0_41_state = {
                                phase: 0,
step: 0,
                            }
const N_m_n_0_39_1_sig_state = {
                                currentValue: 0.15,
                            }
        
function N_n_0_0_rcvs_0(m) {
                            
                NT_tgl_receiveMessage(N_n_0_0_state, m)
                return
            
                            throw new Error('Node "n_0_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_0_34_outs_0 = 0
function N_n_0_34_rcvs_0(m) {
                            
    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
        N_n_0_34_state.currentValue = G_msg_readFloatToken(m, 0)
        return
    }

                            throw new Error('Node "n_0_34", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_42_rcvs_0(m) {
                            
            if (G_msg_getLength(m) === 1) {
                if (
                    (G_msg_isFloatToken(m, 0) && G_msg_readFloatToken(m, 0) === 0)
                    || G_actionUtils_isAction(m, 'stop')
                ) {
                    NT_metro_stop(N_n_0_42_state)
                    return
    
                } else if (
                    G_msg_isFloatToken(m, 0)
                    || G_bangUtils_isBang(m)
                ) {
                    N_n_0_42_state.realNextTick = toFloat(FRAME)
                    NT_metro_scheduleNextTick(N_n_0_42_state)
                    return
                }
            }
        
                            throw new Error('Node "n_0_42", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_1_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                NT_float_setValue(N_n_0_1_state, G_msg_readFloatToken(m, 0))
                N_n_0_1_snds_0(G_msg_floats([N_n_0_1_state.value]))
                return 

            } else if (G_bangUtils_isBang(m)) {
                N_n_0_1_snds_0(G_msg_floats([N_n_0_1_state.value]))
                return
                
            }
        
                            throw new Error('Node "n_0_1", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
function N_n_0_1_rcvs_1(m) {
                            
    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
        NT_float_setValue(N_n_0_1_state, G_msg_readFloatToken(m, 0))
        return
    }

                            throw new Error('Node "n_0_1", inlet "1", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_2_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_add_setLeft(N_n_0_2_state, G_msg_readFloatToken(m, 0))
                        N_n_0_3_rcvs_0(G_msg_floats([N_n_0_2_state.leftOp + N_n_0_2_state.rightOp]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_0_3_rcvs_0(G_msg_floats([N_n_0_2_state.leftOp + N_n_0_2_state.rightOp]))
                        return
                    }
                
                            throw new Error('Node "n_0_2", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_3_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_mod_setLeft(N_n_0_3_state, G_msg_readFloatToken(m, 0))
                        N_n_0_1_rcvs_1(G_msg_floats([N_n_0_3_state.rightOp !== 0 ? (N_n_0_3_state.rightOp + (N_n_0_3_state.leftOp % N_n_0_3_state.rightOp)) % N_n_0_3_state.rightOp: 0]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_0_1_rcvs_1(G_msg_floats([N_n_0_3_state.rightOp !== 0 ? (N_n_0_3_state.rightOp + (N_n_0_3_state.leftOp % N_n_0_3_state.rightOp)) % N_n_0_3_state.rightOp: 0]))
                        return
                    }
                
                            throw new Error('Node "n_0_3", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_4_rcvs_0(m) {
                            
                    
                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 0
                            ) {
                                N_n_0_5_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 1
                            ) {
                                N_n_0_6_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 2
                            ) {
                                N_n_0_7_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 3
                            ) {
                                N_n_0_8_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 4
                            ) {
                                N_n_0_9_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 5
                            ) {
                                N_n_0_10_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 6
                            ) {
                                N_n_0_11_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 7
                            ) {
                                N_n_0_12_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 8
                            ) {
                                N_n_0_13_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 9
                            ) {
                                N_n_0_14_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 10
                            ) {
                                N_n_0_15_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 11
                            ) {
                                N_n_0_16_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 12
                            ) {
                                N_n_0_17_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 13
                            ) {
                                N_n_0_18_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 14
                            ) {
                                N_n_0_19_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        

                            if (
                                G_msg_isFloatToken(m, 0)
                                && G_msg_readFloatToken(m, 0) === 15
                            ) {
                                N_n_0_20_rcvs_0(G_bangUtils_emptyToBang(G_msgUtils_shift(m)))
                                return
                            }
                        
    
                    G_msg_VOID_MESSAGE_RECEIVER(m)
                    return
                
                            throw new Error('Node "n_0_4", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_5_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_5_state.msgSpecs.splice(0, N_n_0_5_state.msgSpecs.length - 1)
                    N_n_0_5_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_5_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_5_state.msgSpecs.length; i++) {
                        if (N_n_0_5_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_5_state.msgSpecs[i].send, N_n_0_5_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_5_snds_0(N_n_0_5_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_5", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_21_rcvs_0(m) {
                            
            N_n_0_22_rcvs_0(G_msg_floats([G_tokenConversion_toFloat(m, 0)]))
N_n_0_25_rcvs_0(G_bangUtils_bang())
N_n_0_24_rcvs_0(G_bangUtils_bang())
            return
        
                            throw new Error('Node "n_0_21", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_24_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_24_state.msgSpecs.splice(0, N_n_0_24_state.msgSpecs.length - 1)
                    N_n_0_24_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_24_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_24_state.msgSpecs.length; i++) {
                        if (N_n_0_24_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_24_state.msgSpecs[i].send, N_n_0_24_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_24_snds_0(N_n_0_24_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_24", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_0_27_outs_0 = 0
function N_n_0_27_rcvs_0(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
            ) {
                switch (G_msg_getLength(m)) {
                    case 2:
                        NT_line_t_setNextDuration(N_n_0_27_state, G_msg_readFloatToken(m, 1))
                    case 1:
                        NT_line_t_setNewLine(N_n_0_27_state, G_msg_readFloatToken(m, 0))
                }
                return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_line_t_stop(N_n_0_27_state)
                return
    
            }
        
                            throw new Error('Node "n_0_27", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_24_0_rcvs_0(m) {
                            
                IO_snd_n_0_24_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_24_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_25_rcvs_0(m) {
                            
            if (G_msg_getLength(m) === 1) {
                if (G_msg_isStringToken(m, 0)) {
                    const action = G_msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        NT_delay_scheduleDelay(
                            N_n_0_25_state, 
                            () => N_n_0_26_rcvs_0(G_bangUtils_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        NT_delay_stop(N_n_0_25_state)
                        return
                    }
                    
                } else if (G_msg_isFloatToken(m, 0)) {
                    NT_delay_setDelay(N_n_0_25_state, G_msg_readFloatToken(m, 0))
                    NT_delay_scheduleDelay(
                        N_n_0_25_state,
                        () => N_n_0_26_rcvs_0(G_bangUtils_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'tempo'
            ) {
                N_n_0_25_state.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    G_msg_readFloatToken(m, 1), 
                    G_msg_readStringToken(m, 2)
                )
                return
            }
        
                            throw new Error('Node "n_0_25", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_26_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_26_state.msgSpecs.splice(0, N_n_0_26_state.msgSpecs.length - 1)
                    N_n_0_26_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_26_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_26_state.msgSpecs.length; i++) {
                        if (N_n_0_26_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_26_state.msgSpecs[i].send, N_n_0_26_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_26_snds_0(N_n_0_26_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_26", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_26_0_rcvs_0(m) {
                            
                IO_snd_n_0_26_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_26_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_22_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        const value = G_msg_readFloatToken(m, 0)
                        N_m_n_0_23_0__routemsg_rcvs_0(G_msg_floats([G_funcs_mtof(value)]))
                        return
                    }
                
                            throw new Error('Node "n_0_22", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_0_23_0__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                N_m_n_0_23_0__routemsg_snds_0(m)
                return
            } else {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            }
        
                            throw new Error('Node "m_n_0_23_0__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_m_n_0_23_0_sig_outs_0 = 0
function N_m_n_0_23_0_sig_rcvs_0(m) {
                            
    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
        N_m_n_0_23_0_sig_state.currentValue = G_msg_readFloatToken(m, 0)
        return
    }

                            throw new Error('Node "m_n_0_23_0_sig", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_5_0_rcvs_0(m) {
                            
                IO_snd_n_0_5_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_5_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_6_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_6_state.msgSpecs.splice(0, N_n_0_6_state.msgSpecs.length - 1)
                    N_n_0_6_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_6_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_6_state.msgSpecs.length; i++) {
                        if (N_n_0_6_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_6_state.msgSpecs[i].send, N_n_0_6_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_6_snds_0(N_n_0_6_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_6", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_6_0_rcvs_0(m) {
                            
                IO_snd_n_0_6_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_6_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_7_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_7_state.msgSpecs.splice(0, N_n_0_7_state.msgSpecs.length - 1)
                    N_n_0_7_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_7_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_7_state.msgSpecs.length; i++) {
                        if (N_n_0_7_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_7_state.msgSpecs[i].send, N_n_0_7_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_7_snds_0(N_n_0_7_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_7", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_7_0_rcvs_0(m) {
                            
                IO_snd_n_0_7_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_7_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_8_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_8_state.msgSpecs.splice(0, N_n_0_8_state.msgSpecs.length - 1)
                    N_n_0_8_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_8_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_8_state.msgSpecs.length; i++) {
                        if (N_n_0_8_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_8_state.msgSpecs[i].send, N_n_0_8_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_8_snds_0(N_n_0_8_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_8", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_8_0_rcvs_0(m) {
                            
                IO_snd_n_0_8_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_8_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_9_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_9_state.msgSpecs.splice(0, N_n_0_9_state.msgSpecs.length - 1)
                    N_n_0_9_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_9_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_9_state.msgSpecs.length; i++) {
                        if (N_n_0_9_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_9_state.msgSpecs[i].send, N_n_0_9_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_9_snds_0(N_n_0_9_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_9", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_9_0_rcvs_0(m) {
                            
                IO_snd_n_0_9_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_9_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_10_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_10_state.msgSpecs.splice(0, N_n_0_10_state.msgSpecs.length - 1)
                    N_n_0_10_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_10_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_10_state.msgSpecs.length; i++) {
                        if (N_n_0_10_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_10_state.msgSpecs[i].send, N_n_0_10_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_10_snds_0(N_n_0_10_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_10", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_10_0_rcvs_0(m) {
                            
                IO_snd_n_0_10_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_10_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_11_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_11_state.msgSpecs.splice(0, N_n_0_11_state.msgSpecs.length - 1)
                    N_n_0_11_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_11_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_11_state.msgSpecs.length; i++) {
                        if (N_n_0_11_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_11_state.msgSpecs[i].send, N_n_0_11_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_11_snds_0(N_n_0_11_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_11", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_11_0_rcvs_0(m) {
                            
                IO_snd_n_0_11_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_11_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_12_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_12_state.msgSpecs.splice(0, N_n_0_12_state.msgSpecs.length - 1)
                    N_n_0_12_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_12_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_12_state.msgSpecs.length; i++) {
                        if (N_n_0_12_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_12_state.msgSpecs[i].send, N_n_0_12_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_12_snds_0(N_n_0_12_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_12", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_12_0_rcvs_0(m) {
                            
                IO_snd_n_0_12_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_12_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_13_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_13_state.msgSpecs.splice(0, N_n_0_13_state.msgSpecs.length - 1)
                    N_n_0_13_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_13_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_13_state.msgSpecs.length; i++) {
                        if (N_n_0_13_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_13_state.msgSpecs[i].send, N_n_0_13_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_13_snds_0(N_n_0_13_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_13", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_13_0_rcvs_0(m) {
                            
                IO_snd_n_0_13_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_13_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_14_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_14_state.msgSpecs.splice(0, N_n_0_14_state.msgSpecs.length - 1)
                    N_n_0_14_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_14_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_14_state.msgSpecs.length; i++) {
                        if (N_n_0_14_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_14_state.msgSpecs[i].send, N_n_0_14_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_14_snds_0(N_n_0_14_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_14", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_14_0_rcvs_0(m) {
                            
                IO_snd_n_0_14_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_14_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_15_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_15_state.msgSpecs.splice(0, N_n_0_15_state.msgSpecs.length - 1)
                    N_n_0_15_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_15_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_15_state.msgSpecs.length; i++) {
                        if (N_n_0_15_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_15_state.msgSpecs[i].send, N_n_0_15_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_15_snds_0(N_n_0_15_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_15", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_15_0_rcvs_0(m) {
                            
                IO_snd_n_0_15_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_15_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_16_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_16_state.msgSpecs.splice(0, N_n_0_16_state.msgSpecs.length - 1)
                    N_n_0_16_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_16_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_16_state.msgSpecs.length; i++) {
                        if (N_n_0_16_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_16_state.msgSpecs[i].send, N_n_0_16_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_16_snds_0(N_n_0_16_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_16", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_16_0_rcvs_0(m) {
                            
                IO_snd_n_0_16_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_16_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_17_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_17_state.msgSpecs.splice(0, N_n_0_17_state.msgSpecs.length - 1)
                    N_n_0_17_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_17_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_17_state.msgSpecs.length; i++) {
                        if (N_n_0_17_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_17_state.msgSpecs[i].send, N_n_0_17_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_17_snds_0(N_n_0_17_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_17", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_17_0_rcvs_0(m) {
                            
                IO_snd_n_0_17_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_17_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_18_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_18_state.msgSpecs.splice(0, N_n_0_18_state.msgSpecs.length - 1)
                    N_n_0_18_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_18_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_18_state.msgSpecs.length; i++) {
                        if (N_n_0_18_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_18_state.msgSpecs[i].send, N_n_0_18_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_18_snds_0(N_n_0_18_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_18", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_18_0_rcvs_0(m) {
                            
                IO_snd_n_0_18_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_18_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_19_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_19_state.msgSpecs.splice(0, N_n_0_19_state.msgSpecs.length - 1)
                    N_n_0_19_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_19_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_19_state.msgSpecs.length; i++) {
                        if (N_n_0_19_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_19_state.msgSpecs[i].send, N_n_0_19_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_19_snds_0(N_n_0_19_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_19", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_19_0_rcvs_0(m) {
                            
                IO_snd_n_0_19_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_19_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_20_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_20_state.msgSpecs.splice(0, N_n_0_20_state.msgSpecs.length - 1)
                    N_n_0_20_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_20_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_20_state.msgSpecs.length; i++) {
                        if (N_n_0_20_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_20_state.msgSpecs[i].send, N_n_0_20_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_20_snds_0(N_n_0_20_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_20", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_20_0_rcvs_0(m) {
                            
                IO_snd_n_0_20_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_20_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_0_0_rcvs_0(m) {
                            
                IO_snd_n_0_0_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_0_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }



function N_n_0_32_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_32_state.msgSpecs.splice(0, N_n_0_32_state.msgSpecs.length - 1)
                    N_n_0_32_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_32_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_32_state.msgSpecs.length; i++) {
                        if (N_n_0_32_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_32_state.msgSpecs[i].send, N_n_0_32_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_ioSnd_n_0_32_0_rcvs_0(N_n_0_32_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_32", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_32_0_rcvs_0(m) {
                            
                IO_snd_n_0_32_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_32_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_33_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_33_state.msgSpecs.splice(0, N_n_0_33_state.msgSpecs.length - 1)
                    N_n_0_33_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_33_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_33_state.msgSpecs.length; i++) {
                        if (N_n_0_33_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_33_state.msgSpecs[i].send, N_n_0_33_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_0_33_snds_0(N_n_0_33_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_33", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_ioSnd_n_0_33_0_rcvs_0(m) {
                            
                IO_snd_n_0_33_0(m)
                return
            
                            throw new Error('Node "n_ioSnd_n_0_33_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }










































let N_n_0_23_outs_0 = 0





let N_n_0_29_outs_0 = 0

let N_m_n_0_40_0_sig_outs_0 = 0

let N_n_0_40_outs_0 = 0

let N_m_n_0_35_1_sig_outs_0 = 0

let N_n_0_35_outs_0 = 0









let N_m_n_0_41_0_sig_outs_0 = 0

let N_n_0_41_outs_0 = 0











function N_n_0_0_snds_0(m) {
                        N_n_0_34_rcvs_0(m)
N_n_0_42_rcvs_0(m)
N_n_ioSnd_n_0_0_0_rcvs_0(m)
COLD_2(m)
                    }
function N_n_0_1_snds_0(m) {
                        N_n_0_2_rcvs_0(m)
N_n_0_4_rcvs_0(m)
                    }
function N_n_0_5_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_5_0_rcvs_0(m)
                    }
function N_n_0_24_snds_0(m) {
                        N_n_0_27_rcvs_0(m)
N_n_ioSnd_n_0_24_0_rcvs_0(m)
                    }
function N_n_0_26_snds_0(m) {
                        N_n_0_27_rcvs_0(m)
N_n_ioSnd_n_0_26_0_rcvs_0(m)
                    }
function N_m_n_0_23_0__routemsg_snds_0(m) {
                        N_m_n_0_23_0_sig_rcvs_0(m)
COLD_0(m)
                    }
function N_n_0_6_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_6_0_rcvs_0(m)
                    }
function N_n_0_7_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_7_0_rcvs_0(m)
                    }
function N_n_0_8_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_8_0_rcvs_0(m)
                    }
function N_n_0_9_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_9_0_rcvs_0(m)
                    }
function N_n_0_10_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_10_0_rcvs_0(m)
                    }
function N_n_0_11_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_11_0_rcvs_0(m)
                    }
function N_n_0_12_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_12_0_rcvs_0(m)
                    }
function N_n_0_13_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_13_0_rcvs_0(m)
                    }
function N_n_0_14_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_14_0_rcvs_0(m)
                    }
function N_n_0_15_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_15_0_rcvs_0(m)
                    }
function N_n_0_16_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_16_0_rcvs_0(m)
                    }
function N_n_0_17_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_17_0_rcvs_0(m)
                    }
function N_n_0_18_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_18_0_rcvs_0(m)
                    }
function N_n_0_19_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_19_0_rcvs_0(m)
                    }
function N_n_0_20_snds_0(m) {
                        N_n_0_21_rcvs_0(m)
N_n_ioSnd_n_0_20_0_rcvs_0(m)
                    }
function N_n_0_31_snds_0(m) {
                        N_n_0_32_rcvs_0(m)
N_n_0_33_rcvs_0(m)
                    }
function N_n_0_33_snds_0(m) {
                        N_n_0_0_rcvs_0(m)
N_n_ioSnd_n_0_33_0_rcvs_0(m)
                    }

        function COLD_0(m) {
                    N_m_n_0_23_0_sig_outs_0 = N_m_n_0_23_0_sig_state.currentValue
                    NT_osc_t_setStep(N_n_0_23_state, N_m_n_0_23_0_sig_outs_0)
                }
function COLD_1(m) {
                    N_m_n_0_40_0_sig_outs_0 = N_m_n_0_40_0_sig_state.currentValue
                    NT_osc_t_setStep(N_n_0_40_state, N_m_n_0_40_0_sig_outs_0)
                }
function COLD_2(m) {
                    N_n_0_34_outs_0 = N_n_0_34_state.currentValue
                    
                }
function COLD_3(m) {
                    N_m_n_0_35_1_sig_outs_0 = N_m_n_0_35_1_sig_state.currentValue
                    NT_lop_t_setFreq(N_n_0_35_state, N_m_n_0_35_1_sig_outs_0)
                }
function COLD_4(m) {
                    N_m_n_0_41_0_sig_outs_0 = N_m_n_0_41_0_sig_state.currentValue
                    NT_osc_t_setStep(N_n_0_41_state, N_m_n_0_41_0_sig_outs_0)
                }
        function IO_rcv_n_0_0_0(m) {
                    N_n_0_0_rcvs_0(m)
                }
function IO_rcv_n_0_5_0(m) {
                    N_n_0_5_rcvs_0(m)
                }
function IO_rcv_n_0_6_0(m) {
                    N_n_0_6_rcvs_0(m)
                }
function IO_rcv_n_0_7_0(m) {
                    N_n_0_7_rcvs_0(m)
                }
function IO_rcv_n_0_8_0(m) {
                    N_n_0_8_rcvs_0(m)
                }
function IO_rcv_n_0_9_0(m) {
                    N_n_0_9_rcvs_0(m)
                }
function IO_rcv_n_0_10_0(m) {
                    N_n_0_10_rcvs_0(m)
                }
function IO_rcv_n_0_11_0(m) {
                    N_n_0_11_rcvs_0(m)
                }
function IO_rcv_n_0_12_0(m) {
                    N_n_0_12_rcvs_0(m)
                }
function IO_rcv_n_0_13_0(m) {
                    N_n_0_13_rcvs_0(m)
                }
function IO_rcv_n_0_14_0(m) {
                    N_n_0_14_rcvs_0(m)
                }
function IO_rcv_n_0_15_0(m) {
                    N_n_0_15_rcvs_0(m)
                }
function IO_rcv_n_0_16_0(m) {
                    N_n_0_16_rcvs_0(m)
                }
function IO_rcv_n_0_17_0(m) {
                    N_n_0_17_rcvs_0(m)
                }
function IO_rcv_n_0_18_0(m) {
                    N_n_0_18_rcvs_0(m)
                }
function IO_rcv_n_0_19_0(m) {
                    N_n_0_19_rcvs_0(m)
                }
function IO_rcv_n_0_20_0(m) {
                    N_n_0_20_rcvs_0(m)
                }
function IO_rcv_n_0_24_0(m) {
                    N_n_0_24_rcvs_0(m)
                }
function IO_rcv_n_0_26_0(m) {
                    N_n_0_26_rcvs_0(m)
                }
function IO_rcv_n_0_32_0(m) {
                    N_n_0_32_rcvs_0(m)
                }
function IO_rcv_n_0_33_0(m) {
                    N_n_0_33_rcvs_0(m)
                }
        const IO_snd_n_0_0_0 = (m) => {exports.io.messageSenders['n_0_0']['0'](m)}
const IO_snd_n_0_5_0 = (m) => {exports.io.messageSenders['n_0_5']['0'](m)}
const IO_snd_n_0_6_0 = (m) => {exports.io.messageSenders['n_0_6']['0'](m)}
const IO_snd_n_0_7_0 = (m) => {exports.io.messageSenders['n_0_7']['0'](m)}
const IO_snd_n_0_8_0 = (m) => {exports.io.messageSenders['n_0_8']['0'](m)}
const IO_snd_n_0_9_0 = (m) => {exports.io.messageSenders['n_0_9']['0'](m)}
const IO_snd_n_0_10_0 = (m) => {exports.io.messageSenders['n_0_10']['0'](m)}
const IO_snd_n_0_11_0 = (m) => {exports.io.messageSenders['n_0_11']['0'](m)}
const IO_snd_n_0_12_0 = (m) => {exports.io.messageSenders['n_0_12']['0'](m)}
const IO_snd_n_0_13_0 = (m) => {exports.io.messageSenders['n_0_13']['0'](m)}
const IO_snd_n_0_14_0 = (m) => {exports.io.messageSenders['n_0_14']['0'](m)}
const IO_snd_n_0_15_0 = (m) => {exports.io.messageSenders['n_0_15']['0'](m)}
const IO_snd_n_0_16_0 = (m) => {exports.io.messageSenders['n_0_16']['0'](m)}
const IO_snd_n_0_17_0 = (m) => {exports.io.messageSenders['n_0_17']['0'](m)}
const IO_snd_n_0_18_0 = (m) => {exports.io.messageSenders['n_0_18']['0'](m)}
const IO_snd_n_0_19_0 = (m) => {exports.io.messageSenders['n_0_19']['0'](m)}
const IO_snd_n_0_20_0 = (m) => {exports.io.messageSenders['n_0_20']['0'](m)}
const IO_snd_n_0_24_0 = (m) => {exports.io.messageSenders['n_0_24']['0'](m)}
const IO_snd_n_0_26_0 = (m) => {exports.io.messageSenders['n_0_26']['0'](m)}
const IO_snd_n_0_32_0 = (m) => {exports.io.messageSenders['n_0_32']['0'](m)}
const IO_snd_n_0_33_0 = (m) => {exports.io.messageSenders['n_0_33']['0'](m)}

        const exports = {
            metadata: {"libVersion":"0.2.1","customMetadata":{"pdNodes":{"0":{"0":{"id":"0","type":"tgl","args":[1,0,0,"",""],"nodeClass":"control","layout":{"x":372,"y":260,"size":30,"label":"on/off","labelX":0,"labelY":-6,"labelFont":"0","labelFontSize":8,"bgColor":"#fcfcfc","fgColor":"#000000","labelColor":"#000000"}},"5":{"id":"5","type":"msg","args":[60],"nodeClass":"control","layout":{"x":532,"y":514}},"6":{"id":"6","type":"msg","args":[67],"nodeClass":"control","layout":{"x":562,"y":514}},"7":{"id":"7","type":"msg","args":[72],"nodeClass":"control","layout":{"x":592,"y":514}},"8":{"id":"8","type":"msg","args":[74],"nodeClass":"control","layout":{"x":622,"y":514}},"9":{"id":"9","type":"msg","args":[72],"nodeClass":"control","layout":{"x":652,"y":514}},"10":{"id":"10","type":"msg","args":[67],"nodeClass":"control","layout":{"x":682,"y":514}},"11":{"id":"11","type":"msg","args":[64],"nodeClass":"control","layout":{"x":712,"y":514}},"12":{"id":"12","type":"msg","args":[67],"nodeClass":"control","layout":{"x":742,"y":514}},"13":{"id":"13","type":"msg","args":[60],"nodeClass":"control","layout":{"x":772,"y":514}},"14":{"id":"14","type":"msg","args":[67],"nodeClass":"control","layout":{"x":802,"y":514}},"15":{"id":"15","type":"msg","args":[75],"nodeClass":"control","layout":{"x":832,"y":514}},"16":{"id":"16","type":"msg","args":[74],"nodeClass":"control","layout":{"x":862,"y":514}},"17":{"id":"17","type":"msg","args":[70],"nodeClass":"control","layout":{"x":892,"y":514}},"18":{"id":"18","type":"msg","args":[67],"nodeClass":"control","layout":{"x":922,"y":514}},"19":{"id":"19","type":"msg","args":[62],"nodeClass":"control","layout":{"x":952,"y":514}},"20":{"id":"20","type":"msg","args":[67],"nodeClass":"control","layout":{"x":982,"y":514}},"24":{"id":"24","type":"msg","args":[0.63,30],"nodeClass":"control","layout":{"x":772,"y":584}},"26":{"id":"26","type":"msg","args":[0,30],"nodeClass":"control","layout":{"x":872,"y":624}},"32":{"id":"32","type":"msg","args":[";","pd","dsp",1],"nodeClass":"control","layout":{"x":110,"y":235}},"33":{"id":"33","type":"msg","args":[1],"nodeClass":"control","layout":{"x":225,"y":237}}}},"graph":{"n_0_0":{"id":"n_0_0","type":"tgl","args":{"minValue":0,"maxValue":1,"sendBusName":"empty","receiveBusName":"empty","initValue":0,"outputOnLoad":false},"sources":{"0":[{"nodeId":"n_0_33","portletId":"0"},{"nodeId":"n_ioRcv_n_0_0_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_34","portletId":"0"},{"nodeId":"n_0_42","portletId":"0"},{"nodeId":"n_ioSnd_n_0_0_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}},"isPushingMessages":true},"n_0_5":{"id":"n_0_5","type":"msg","args":{"msgSpecs":[{"tokens":[60],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"0"},{"nodeId":"n_ioRcv_n_0_5_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_5_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_6":{"id":"n_0_6","type":"msg","args":{"msgSpecs":[{"tokens":[67],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"1"},{"nodeId":"n_ioRcv_n_0_6_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_6_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_7":{"id":"n_0_7","type":"msg","args":{"msgSpecs":[{"tokens":[72],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"2"},{"nodeId":"n_ioRcv_n_0_7_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_7_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_8":{"id":"n_0_8","type":"msg","args":{"msgSpecs":[{"tokens":[74],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"3"},{"nodeId":"n_ioRcv_n_0_8_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_8_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_9":{"id":"n_0_9","type":"msg","args":{"msgSpecs":[{"tokens":[72],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"4"},{"nodeId":"n_ioRcv_n_0_9_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_9_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_10":{"id":"n_0_10","type":"msg","args":{"msgSpecs":[{"tokens":[67],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"5"},{"nodeId":"n_ioRcv_n_0_10_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_10_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_11":{"id":"n_0_11","type":"msg","args":{"msgSpecs":[{"tokens":[64],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"6"},{"nodeId":"n_ioRcv_n_0_11_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_11_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_12":{"id":"n_0_12","type":"msg","args":{"msgSpecs":[{"tokens":[67],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"7"},{"nodeId":"n_ioRcv_n_0_12_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_12_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_13":{"id":"n_0_13","type":"msg","args":{"msgSpecs":[{"tokens":[60],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"8"},{"nodeId":"n_ioRcv_n_0_13_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_13_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_14":{"id":"n_0_14","type":"msg","args":{"msgSpecs":[{"tokens":[67],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"9"},{"nodeId":"n_ioRcv_n_0_14_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_14_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_15":{"id":"n_0_15","type":"msg","args":{"msgSpecs":[{"tokens":[75],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"10"},{"nodeId":"n_ioRcv_n_0_15_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_15_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_16":{"id":"n_0_16","type":"msg","args":{"msgSpecs":[{"tokens":[74],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"11"},{"nodeId":"n_ioRcv_n_0_16_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_16_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_17":{"id":"n_0_17","type":"msg","args":{"msgSpecs":[{"tokens":[70],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"12"},{"nodeId":"n_ioRcv_n_0_17_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_17_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_18":{"id":"n_0_18","type":"msg","args":{"msgSpecs":[{"tokens":[67],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"13"},{"nodeId":"n_ioRcv_n_0_18_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_18_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_19":{"id":"n_0_19","type":"msg","args":{"msgSpecs":[{"tokens":[62],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"14"},{"nodeId":"n_ioRcv_n_0_19_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_19_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_20":{"id":"n_0_20","type":"msg","args":{"msgSpecs":[{"tokens":[67],"send":null}]},"sources":{"0":[{"nodeId":"n_0_4","portletId":"15"},{"nodeId":"n_ioRcv_n_0_20_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioSnd_n_0_20_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_24":{"id":"n_0_24","type":"msg","args":{"msgSpecs":[{"tokens":[0.63,30],"send":null}]},"sources":{"0":[{"nodeId":"n_0_21","portletId":"0"},{"nodeId":"n_ioRcv_n_0_24_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_27","portletId":"0"},{"nodeId":"n_ioSnd_n_0_24_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_26":{"id":"n_0_26","type":"msg","args":{"msgSpecs":[{"tokens":[0,30],"send":null}]},"sources":{"0":[{"nodeId":"n_0_25","portletId":"0"},{"nodeId":"n_ioRcv_n_0_26_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_27","portletId":"0"},{"nodeId":"n_ioSnd_n_0_26_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_32":{"id":"n_0_32","type":"msg","args":{"msgSpecs":[{"tokens":["dsp",1],"send":"pd"}]},"sources":{"0":[{"nodeId":"n_0_31","portletId":"0"},{"nodeId":"n_ioRcv_n_0_32_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_ioSnd_n_0_32_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}},"n_0_33":{"id":"n_0_33","type":"msg","args":{"msgSpecs":[{"tokens":[1],"send":null}]},"sources":{"0":[{"nodeId":"n_0_31","portletId":"0"},{"nodeId":"n_ioRcv_n_0_33_0","portletId":"0"}]},"sinks":{"0":[{"nodeId":"n_0_0","portletId":"0"},{"nodeId":"n_ioSnd_n_0_33_0","portletId":"0"}]},"inlets":{"0":{"type":"message","id":"0"}},"outlets":{"0":{"type":"message","id":"0"}}}},"pdGui":[{"nodeClass":"control","patchId":"0","pdNodeId":"0","nodeId":"n_0_0"},{"nodeClass":"control","patchId":"0","pdNodeId":"5","nodeId":"n_0_5"},{"nodeClass":"control","patchId":"0","pdNodeId":"6","nodeId":"n_0_6"},{"nodeClass":"control","patchId":"0","pdNodeId":"7","nodeId":"n_0_7"},{"nodeClass":"control","patchId":"0","pdNodeId":"8","nodeId":"n_0_8"},{"nodeClass":"control","patchId":"0","pdNodeId":"9","nodeId":"n_0_9"},{"nodeClass":"control","patchId":"0","pdNodeId":"10","nodeId":"n_0_10"},{"nodeClass":"control","patchId":"0","pdNodeId":"11","nodeId":"n_0_11"},{"nodeClass":"control","patchId":"0","pdNodeId":"12","nodeId":"n_0_12"},{"nodeClass":"control","patchId":"0","pdNodeId":"13","nodeId":"n_0_13"},{"nodeClass":"control","patchId":"0","pdNodeId":"14","nodeId":"n_0_14"},{"nodeClass":"control","patchId":"0","pdNodeId":"15","nodeId":"n_0_15"},{"nodeClass":"control","patchId":"0","pdNodeId":"16","nodeId":"n_0_16"},{"nodeClass":"control","patchId":"0","pdNodeId":"17","nodeId":"n_0_17"},{"nodeClass":"control","patchId":"0","pdNodeId":"18","nodeId":"n_0_18"},{"nodeClass":"control","patchId":"0","pdNodeId":"19","nodeId":"n_0_19"},{"nodeClass":"control","patchId":"0","pdNodeId":"20","nodeId":"n_0_20"},{"nodeClass":"control","patchId":"0","pdNodeId":"24","nodeId":"n_0_24"},{"nodeClass":"control","patchId":"0","pdNodeId":"26","nodeId":"n_0_26"},{"nodeClass":"control","patchId":"0","pdNodeId":"32","nodeId":"n_0_32"},{"nodeClass":"control","patchId":"0","pdNodeId":"33","nodeId":"n_0_33"}]},"settings":{"audio":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0},"io":{"messageReceivers":{"n_0_0":["0"],"n_0_5":["0"],"n_0_6":["0"],"n_0_7":["0"],"n_0_8":["0"],"n_0_9":["0"],"n_0_10":["0"],"n_0_11":["0"],"n_0_12":["0"],"n_0_13":["0"],"n_0_14":["0"],"n_0_15":["0"],"n_0_16":["0"],"n_0_17":["0"],"n_0_18":["0"],"n_0_19":["0"],"n_0_20":["0"],"n_0_24":["0"],"n_0_26":["0"],"n_0_32":["0"],"n_0_33":["0"]},"messageSenders":{"n_0_0":["0"],"n_0_5":["0"],"n_0_6":["0"],"n_0_7":["0"],"n_0_8":["0"],"n_0_9":["0"],"n_0_10":["0"],"n_0_11":["0"],"n_0_12":["0"],"n_0_13":["0"],"n_0_14":["0"],"n_0_15":["0"],"n_0_16":["0"],"n_0_17":["0"],"n_0_18":["0"],"n_0_19":["0"],"n_0_20":["0"],"n_0_24":["0"],"n_0_26":["0"],"n_0_32":["0"],"n_0_33":["0"]}}},"compilation":{"variableNamesIndex":{"io":{"messageReceivers":{"n_0_0":{"0":"IO_rcv_n_0_0_0"},"n_0_5":{"0":"IO_rcv_n_0_5_0"},"n_0_6":{"0":"IO_rcv_n_0_6_0"},"n_0_7":{"0":"IO_rcv_n_0_7_0"},"n_0_8":{"0":"IO_rcv_n_0_8_0"},"n_0_9":{"0":"IO_rcv_n_0_9_0"},"n_0_10":{"0":"IO_rcv_n_0_10_0"},"n_0_11":{"0":"IO_rcv_n_0_11_0"},"n_0_12":{"0":"IO_rcv_n_0_12_0"},"n_0_13":{"0":"IO_rcv_n_0_13_0"},"n_0_14":{"0":"IO_rcv_n_0_14_0"},"n_0_15":{"0":"IO_rcv_n_0_15_0"},"n_0_16":{"0":"IO_rcv_n_0_16_0"},"n_0_17":{"0":"IO_rcv_n_0_17_0"},"n_0_18":{"0":"IO_rcv_n_0_18_0"},"n_0_19":{"0":"IO_rcv_n_0_19_0"},"n_0_20":{"0":"IO_rcv_n_0_20_0"},"n_0_24":{"0":"IO_rcv_n_0_24_0"},"n_0_26":{"0":"IO_rcv_n_0_26_0"},"n_0_32":{"0":"IO_rcv_n_0_32_0"},"n_0_33":{"0":"IO_rcv_n_0_33_0"}},"messageSenders":{"n_0_0":{"0":"IO_snd_n_0_0_0"},"n_0_5":{"0":"IO_snd_n_0_5_0"},"n_0_6":{"0":"IO_snd_n_0_6_0"},"n_0_7":{"0":"IO_snd_n_0_7_0"},"n_0_8":{"0":"IO_snd_n_0_8_0"},"n_0_9":{"0":"IO_snd_n_0_9_0"},"n_0_10":{"0":"IO_snd_n_0_10_0"},"n_0_11":{"0":"IO_snd_n_0_11_0"},"n_0_12":{"0":"IO_snd_n_0_12_0"},"n_0_13":{"0":"IO_snd_n_0_13_0"},"n_0_14":{"0":"IO_snd_n_0_14_0"},"n_0_15":{"0":"IO_snd_n_0_15_0"},"n_0_16":{"0":"IO_snd_n_0_16_0"},"n_0_17":{"0":"IO_snd_n_0_17_0"},"n_0_18":{"0":"IO_snd_n_0_18_0"},"n_0_19":{"0":"IO_snd_n_0_19_0"},"n_0_20":{"0":"IO_snd_n_0_20_0"},"n_0_24":{"0":"IO_snd_n_0_24_0"},"n_0_26":{"0":"IO_snd_n_0_26_0"},"n_0_32":{"0":"IO_snd_n_0_32_0"},"n_0_33":{"0":"IO_snd_n_0_33_0"}}},"globals":{"commons":{"getArray":"G_commons_getArray","setArray":"G_commons_setArray"}}}}},
            initialize: (sampleRate, blockSize) => {
                exports.metadata.settings.audio.sampleRate = sampleRate
                exports.metadata.settings.audio.blockSize = blockSize
                SAMPLE_RATE = sampleRate
                BLOCK_SIZE = blockSize

                
                N_n_0_0_state.messageSender = N_n_0_0_snds_0
                N_n_0_0_state.messageReceiver = function (m) {
                    NT_tgl_receiveMessage(N_n_0_0_state, m)
                }
                NT_tgl_setReceiveBusName(N_n_0_0_state, "empty")
    
                
            


            N_n_0_42_state.snd0 = N_n_0_1_rcvs_0
            N_n_0_42_state.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            NT_metro_setRate(N_n_0_42_state, 180)
            N_n_0_42_state.tickCallback = function () {
                NT_metro_scheduleNextTick(N_n_0_42_state)
            }
        

            NT_float_setValue(N_n_0_1_state, 0)
        

            NT_add_setLeft(N_n_0_2_state, 0)
            NT_add_setRight(N_n_0_2_state, 1)
        

            NT_mod_setLeft(N_n_0_3_state, 0)
            NT_mod_setRight(N_n_0_3_state, 16)
        


            N_n_0_5_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_5_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_5_state.msgSpecs[0].outTemplate = []

                N_n_0_5_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_5_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_5_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_5_state.msgSpecs[0].outMessage, 0, 60)
            
        


            N_n_0_24_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_24_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_24_state.msgSpecs[0].outTemplate = []

                N_n_0_24_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            

                N_n_0_24_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_24_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_24_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_24_state.msgSpecs[0].outMessage, 0, 0.63)
            

                G_msg_writeFloatToken(N_n_0_24_state.msgSpecs[0].outMessage, 1, 30)
            
        



        N_n_0_25_state.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
        NT_delay_setDelay(N_n_0_25_state, 180)
    

            N_n_0_26_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_26_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_26_state.msgSpecs[0].outTemplate = []

                N_n_0_26_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            

                N_n_0_26_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_26_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_26_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_26_state.msgSpecs[0].outMessage, 0, 0)
            

                G_msg_writeFloatToken(N_n_0_26_state.msgSpecs[0].outMessage, 1, 30)
            
        






            N_n_0_6_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_6_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_6_state.msgSpecs[0].outTemplate = []

                N_n_0_6_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_6_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_6_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_6_state.msgSpecs[0].outMessage, 0, 67)
            
        


            N_n_0_7_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_7_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_7_state.msgSpecs[0].outTemplate = []

                N_n_0_7_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_7_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_7_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_7_state.msgSpecs[0].outMessage, 0, 72)
            
        


            N_n_0_8_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_8_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_8_state.msgSpecs[0].outTemplate = []

                N_n_0_8_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_8_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_8_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_8_state.msgSpecs[0].outMessage, 0, 74)
            
        


            N_n_0_9_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_9_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_9_state.msgSpecs[0].outTemplate = []

                N_n_0_9_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_9_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_9_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_9_state.msgSpecs[0].outMessage, 0, 72)
            
        


            N_n_0_10_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_10_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_10_state.msgSpecs[0].outTemplate = []

                N_n_0_10_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_10_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_10_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_10_state.msgSpecs[0].outMessage, 0, 67)
            
        


            N_n_0_11_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_11_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_11_state.msgSpecs[0].outTemplate = []

                N_n_0_11_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_11_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_11_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_11_state.msgSpecs[0].outMessage, 0, 64)
            
        


            N_n_0_12_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_12_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_12_state.msgSpecs[0].outTemplate = []

                N_n_0_12_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_12_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_12_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_12_state.msgSpecs[0].outMessage, 0, 67)
            
        


            N_n_0_13_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_13_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_13_state.msgSpecs[0].outTemplate = []

                N_n_0_13_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_13_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_13_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_13_state.msgSpecs[0].outMessage, 0, 60)
            
        


            N_n_0_14_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_14_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_14_state.msgSpecs[0].outTemplate = []

                N_n_0_14_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_14_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_14_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_14_state.msgSpecs[0].outMessage, 0, 67)
            
        


            N_n_0_15_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_15_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_15_state.msgSpecs[0].outTemplate = []

                N_n_0_15_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_15_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_15_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_15_state.msgSpecs[0].outMessage, 0, 75)
            
        


            N_n_0_16_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_16_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_16_state.msgSpecs[0].outTemplate = []

                N_n_0_16_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_16_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_16_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_16_state.msgSpecs[0].outMessage, 0, 74)
            
        


            N_n_0_17_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_17_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_17_state.msgSpecs[0].outTemplate = []

                N_n_0_17_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_17_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_17_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_17_state.msgSpecs[0].outMessage, 0, 70)
            
        


            N_n_0_18_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_18_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_18_state.msgSpecs[0].outTemplate = []

                N_n_0_18_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_18_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_18_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_18_state.msgSpecs[0].outMessage, 0, 67)
            
        


            N_n_0_19_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_19_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_19_state.msgSpecs[0].outTemplate = []

                N_n_0_19_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_19_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_19_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_19_state.msgSpecs[0].outMessage, 0, 62)
            
        


            N_n_0_20_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_20_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_20_state.msgSpecs[0].outTemplate = []

                N_n_0_20_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_20_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_20_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_20_state.msgSpecs[0].outMessage, 0, 67)
            
        


G_commons_waitFrame(0, () => N_n_0_31_snds_0(G_bangUtils_bang()))

            N_n_0_32_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_32_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "pd",
                        hasSend: true,
                    },
            ]

            
        
        
        
    
N_n_0_32_state.msgSpecs[0].outTemplate = []

                N_n_0_32_state.msgSpecs[0].outTemplate.push(G_msg_STRING_TOKEN)
                N_n_0_32_state.msgSpecs[0].outTemplate.push(3)
            

                N_n_0_32_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_32_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_32_state.msgSpecs[0].outTemplate)

                G_msg_writeStringToken(N_n_0_32_state.msgSpecs[0].outMessage, 0, "dsp")
            

                G_msg_writeFloatToken(N_n_0_32_state.msgSpecs[0].outMessage, 1, 1)
            
        


            N_n_0_33_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_33_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_33_state.msgSpecs[0].outTemplate = []

                N_n_0_33_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_0_33_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_33_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_0_33_state.msgSpecs[0].outMessage, 0, 1)
            
        























            NT_osc_t_setStep(N_n_0_23_state, 0)
        





            NT_osc_t_setStep(N_n_0_40_state, 0)
        








            NT_osc_t_setStep(N_n_0_41_state, 0)
        





                COLD_0(G_msg_EMPTY_MESSAGE)
COLD_1(G_msg_EMPTY_MESSAGE)
COLD_2(G_msg_EMPTY_MESSAGE)
COLD_3(G_msg_EMPTY_MESSAGE)
COLD_4(G_msg_EMPTY_MESSAGE)
            },
            dspLoop: (INPUT, OUTPUT) => {
                
        for (IT_FRAME = 0; IT_FRAME < BLOCK_SIZE; IT_FRAME++) {
            G_commons__emitFrame(FRAME)
            
                N_n_0_23_outs_0 = Math.cos(N_n_0_23_state.phase)
                N_n_0_23_state.phase += N_n_0_23_state.step
            

        N_n_0_27_outs_0 = N_n_0_27_state.currentValue
        if (toFloat(FRAME) < N_n_0_27_state.currentLine.p1.x) {
            N_n_0_27_state.currentValue += N_n_0_27_state.currentLine.dy
            if (toFloat(FRAME + 1) >= N_n_0_27_state.currentLine.p1.x) {
                N_n_0_27_state.currentValue = N_n_0_27_state.currentLine.p1.y
            }
        }
    
N_n_0_29_outs_0 = (N_n_0_23_outs_0 * N_n_0_27_outs_0) * (N_m_n_0_29_1_sig_state.currentValue)

                N_n_0_40_outs_0 = Math.cos(N_n_0_40_state.phase)
                N_n_0_40_state.phase += N_n_0_40_state.step
            
N_n_0_35_state.previous = N_n_0_35_outs_0 = N_n_0_35_state.coeff * N_n_0_34_outs_0 + (1 - N_n_0_35_state.coeff) * N_n_0_35_state.previous

                N_n_0_41_outs_0 = Math.cos(N_n_0_41_state.phase)
                N_n_0_41_state.phase += N_n_0_41_state.step
            
OUTPUT[0][IT_FRAME] = (N_n_0_29_outs_0 + ((N_n_0_40_outs_0 * N_n_0_35_outs_0) * (N_m_n_0_38_1_sig_state.currentValue)))
OUTPUT[1][IT_FRAME] = (N_n_0_29_outs_0 + ((N_n_0_41_outs_0 * N_n_0_35_outs_0) * (N_m_n_0_39_1_sig_state.currentValue)))
            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    n_0_0: {
                            "0": IO_rcv_n_0_0_0,
                        },
n_0_5: {
                            "0": IO_rcv_n_0_5_0,
                        },
n_0_6: {
                            "0": IO_rcv_n_0_6_0,
                        },
n_0_7: {
                            "0": IO_rcv_n_0_7_0,
                        },
n_0_8: {
                            "0": IO_rcv_n_0_8_0,
                        },
n_0_9: {
                            "0": IO_rcv_n_0_9_0,
                        },
n_0_10: {
                            "0": IO_rcv_n_0_10_0,
                        },
n_0_11: {
                            "0": IO_rcv_n_0_11_0,
                        },
n_0_12: {
                            "0": IO_rcv_n_0_12_0,
                        },
n_0_13: {
                            "0": IO_rcv_n_0_13_0,
                        },
n_0_14: {
                            "0": IO_rcv_n_0_14_0,
                        },
n_0_15: {
                            "0": IO_rcv_n_0_15_0,
                        },
n_0_16: {
                            "0": IO_rcv_n_0_16_0,
                        },
n_0_17: {
                            "0": IO_rcv_n_0_17_0,
                        },
n_0_18: {
                            "0": IO_rcv_n_0_18_0,
                        },
n_0_19: {
                            "0": IO_rcv_n_0_19_0,
                        },
n_0_20: {
                            "0": IO_rcv_n_0_20_0,
                        },
n_0_24: {
                            "0": IO_rcv_n_0_24_0,
                        },
n_0_26: {
                            "0": IO_rcv_n_0_26_0,
                        },
n_0_32: {
                            "0": IO_rcv_n_0_32_0,
                        },
n_0_33: {
                            "0": IO_rcv_n_0_33_0,
                        },
                },
                messageSenders: {
                    n_0_0: {
                            "0": () => undefined,
                        },
n_0_5: {
                            "0": () => undefined,
                        },
n_0_6: {
                            "0": () => undefined,
                        },
n_0_7: {
                            "0": () => undefined,
                        },
n_0_8: {
                            "0": () => undefined,
                        },
n_0_9: {
                            "0": () => undefined,
                        },
n_0_10: {
                            "0": () => undefined,
                        },
n_0_11: {
                            "0": () => undefined,
                        },
n_0_12: {
                            "0": () => undefined,
                        },
n_0_13: {
                            "0": () => undefined,
                        },
n_0_14: {
                            "0": () => undefined,
                        },
n_0_15: {
                            "0": () => undefined,
                        },
n_0_16: {
                            "0": () => undefined,
                        },
n_0_17: {
                            "0": () => undefined,
                        },
n_0_18: {
                            "0": () => undefined,
                        },
n_0_19: {
                            "0": () => undefined,
                        },
n_0_20: {
                            "0": () => undefined,
                        },
n_0_24: {
                            "0": () => undefined,
                        },
n_0_26: {
                            "0": () => undefined,
                        },
n_0_32: {
                            "0": () => undefined,
                        },
n_0_33: {
                            "0": () => undefined,
                        },
                },
            }
        }

        
exports.G_commons_getArray = G_commons_getArray
exports.G_commons_setArray = G_commons_setArray
    