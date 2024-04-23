import React, {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Row, Col, Form, Button} from 'react-bootstrap';

const App = () => {

    const [fC, setFC] = useState(70)
    const [fM, setFM] = useState(10)
    const [m, setM] = useState(0.3)

    const [t, setT] = useState(1)

    const [car, setCar] = useState()
    const [mess, setMess] = useState()
    const [mod, setMod] = useState()

    const [carSpec, setCarSpec] = useState()
    const [messSpec, setMessSpec] = useState()
    const [modSpec, setModSpec] = useState()

    const [x, setX] = useState()
    const [xSpec, setXSpec] = useState()

    const handleFCChange = (e) => {
        setFC(parseFloat(e.target.value))
    }

    const handleFMChange = (e) => {
        setFM(parseFloat(e.target.value))
    }

    const handleMChange = (e) => {
        setM(parseFloat(e.target.value))
    }

    const handleTChange = (e) => {
        setT(parseFloat(e.target.value))
    }

    const checkForms = () => {
        if (fC === '') {
            alert('Введите частоту несущего колебания')
            return false
        }
        if (fM === '') {
            alert('Введите частоту информационного сигнала')
            return false
        }
        if (m === '') {
            alert('Введите коэффициент модуляции')
            return false
        }
        if (t === '') {
            alert('Введите t')
            return false
        }

        if (fC <= 0) {
            alert('Частота несущего колебания должна быть положительной')
            return false
        }
        if (fM <= 0) {
            alert('Частота информационного сигнала должна быть положительной')
            return false
        }
        if (m < 0 || m > 1) {
            alert('Должно быть 0 <= m <= 1')
            return false
        }
        if (t <= 0) {
            alert('Время должно быть положительным')
            return false
        }

        return true
    }

    const calculateFFT = (signal) => {
        const len = signal.length
        const fftResult = new Array(len).fill(0).map(() => ({ re: 0, im: 0 }))

        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len; j++) {
                fftResult[i].re += signal[j] * Math.cos(-2 * Math.PI * i * j / len)
                fftResult[i].im += signal[j] * Math.sin(-2 * Math.PI * i * j / len)
            }
            fftResult[i].re /= len
            fftResult[i].im /= len
        }

        return fftResult;
    }

    const handlePlotUpdate = () => {
        if (!checkForms()) {
            return
        }

        const step = t / 1000
        const aC = 1
        const aM = m * aC

        const newX = Array.from(
            {length: 1000},
            (_, index) => index * step
        )

        const newCar = newX.map(time =>
            aC * Math.cos(2 * Math.PI * fC * time)
        )
        const newMess = newX.map(time =>
            aM * Math.cos(2 * Math.PI * fM * time)
        )
        const newMod = newX.map(time =>
            (aC + (aM * m) * Math.cos(2 *  Math.PI * fM * time)) * Math.cos(2 * Math.PI * fC * time)
        )

        const carSpectrum = calculateFFT(newCar);
        const messSpectrum = calculateFFT(newMess);
        const modSpectrum = calculateFFT(newMod);

        const carMagnitudeSpectrum = carSpectrum.map((m) =>
            2 * Math.sqrt(Math.pow(m.re, 2) + Math.pow(m.im, 2))
        )
        const messMagnitudeSpectrum = messSpectrum.map((m) =>
            2 * Math.sqrt(Math.pow(m.re, 2) + Math.pow(m.im, 2))
        )
        const modMagnitudeSpectrum = modSpectrum.map((m) =>
            2 * Math.sqrt(Math.pow(m.re, 2) + Math.pow(m.im, 2))
        )

        setX(newX);
        setCar(newCar);
        setMess(newMess);
        setMod(newMod);
        setCarSpec(carMagnitudeSpectrum);
        setMessSpec(messMagnitudeSpectrum);
        setModSpec(modMagnitudeSpectrum);
        setXSpec(Array.from({ length: 1000 }, (_, i) => i * (t / 1000)))
    }

    useEffect(() => {
        handlePlotUpdate()
    }, [])

    return (
        <div className={"container-fluid"}>
            <h1>Моделирование амплитудной модуляции сигнала.</h1>
            <Row>
                <Col xs={12} md={3}>
                    <Form>
                        <div style={{marginBottom: '10px', marginTop: '70px'}}>
                            <Form.Group controlId="fC">
                                <Form.Label>Частота несущего колебания, F<sub>c</sub> (Гц)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={fC}
                                    onChange={handleFCChange}
                                />
                            </Form.Group>
                        </div>
                        <div style={{marginBottom: '10px'}}>
                            <Form.Group controlId="fM">
                                <Form.Label>Частота информационного сигнала, F<sub>m</sub> (Гц)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={fM}
                                    onChange={handleFMChange}
                                />
                            </Form.Group>
                        </div>
                        <div style={{marginBottom: '10px'}}>
                            <Form.Group controlId="m">
                                <Form.Label>Коэффициент модуляции, m</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={m}
                                    onChange={handleMChange}
                                />
                            </Form.Group>
                        </div>
                        <div style={{marginBottom: '10px'}}>
                            <Form.Group controlId="t">
                                <Form.Label>Время, t (с)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={t}
                                    onChange={handleTChange}
                                />
                            </Form.Group>
                        </div>
                        <div>
                            <Button variant="primary" onClick={handlePlotUpdate}>Построить графики</Button>
                        </div>
                    </Form>
                </Col>
                <Col xs={12} md={9}>
                    <Plot
                        data={[
                            {
                                x: x,
                                y: car,
                                type: 'scatter',
                                mode: 'lines',
                                line: { color: 'red' }
                            }
                        ]}
                        layout={{
                            width: '1200',
                            height: '600',
                            xaxis: {title: 'Время, с'},
                            yaxis: {title: 'Амплитуда'},
                            title: 'Несущий сигнал'
                        }}
                    />
                    <Plot
                        data={[
                            {
                                x: x,
                                y: mess,
                                type: 'scatter',
                                mode: 'lines',
                                line: { color: 'blue' }
                            }
                        ]}
                        layout={{
                            width: '1200',
                            height: '600',
                            xaxis: {title: 'Время, с'},
                            yaxis: {title: 'Амплитуда'},
                            title: 'Информационный сигнал'
                        }}
                    />
                    <Plot
                        data={[
                            {
                                x: x,
                                y: mod,
                                type: 'scatter',
                                mode: 'lines',
                                line: { color: 'gray' }
                            }
                        ]}
                        layout={{
                            width: '1200',
                            height: '600',
                            xaxis: {title: 'Время, с'},
                            yaxis: {title: 'Амплитуда'},
                            title: 'Результат модуляции'
                        }}
                    />
                    <Plot
                        data={[
                            {
                                x: xSpec,
                                y: carSpec,
                                type: 'scatter',
                                mode: 'lines',
                                line: { color: 'red' }
                            }
                        ]}
                        layout={{
                            width: '1200',
                            height: '600',
                            xaxis: {title: 'Частота (Гц)'},
                            yaxis: {title: 'Амплитуда'},
                            title: 'Спектр несущего сигнала'
                        }}
                    />
                    <Plot
                        data={[
                            {
                                x: xSpec,
                                y: messSpec,
                                type: 'scatter',
                                mode: 'lines',
                                line: { color: 'blue' }
                            }
                        ]}
                        layout={{
                            width: '1200',
                            height: '600',
                            xaxis: {title: 'Частота (Гц)'},
                            yaxis: {title: 'Амплитуда'},
                            title: 'Спектр информационного сигнала'
                        }}
                    />
                    <Plot
                        data={[
                            {
                                x: xSpec,
                                y: modSpec,
                                type: 'scatter',
                                mode: 'lines',
                                line: { color: 'gray' }
                            }
                        ]}
                        layout={{
                            width: '1200',
                            height: '600',
                            xaxis: {title: 'Частота (Гц)'},
                            yaxis: {title: 'Амплитуда'},
                            title: 'Спектр результа модуляции'
                        }}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default App
