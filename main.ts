// Infrared Wireless Module Kit for microbit
// (receiver module+remote controller)
// author: jieliang mo
// github:https://github.com/mworkfun
// Write the date: 2020-6-19

const enum IrButton {
    //% block=" "
    Any = -1,
    //% block="▲"
    Up = 70,
    //% block=" "
    Unused_2 = -2,
    //% block="◀"
    Left = 68,
    //% block="OK"
    Ok = 64,
    //% block="▶"
    Right = 67,
    //% block=" "
    Unused_3 = -3,
    //% block="▼"
    Down = 21,
    //% block=" "
    Unused_4 = -4,
    //% block="1"
    Number_1 = 22,
    //% block="2"
    Number_2 = 25,
    //% block="3"
    Number_3 = 13,
    //% block="4"
    Number_4 = 12,
    //% block="5"
    Number_5 = 24,
    //% block="6"
    Number_6 = 94,
    //% block="7"
    Number_7 = 8,
    //% block="8"
    Number_8 = 28,
    //% block="9"
    Number_9 = 90,
    //% block="*"
    Star = 66,
    //% block="0"
    Number_0 = 82,
    //% block="#"
    Hash = 74
}
/**
 * criar namespace ControloIV
 * usar para recetor IV e kit de emissão IV
 * author: jieliang mo
 * Write the date: 2020-6-19
 */
//% color="#ff6800" weight=10 icon="\uf1eb"
namespace ControloIV {
    /**
     * definir uma classe de recetor IV
     */
    class irReceiver {
        constructor() {
            this.address = 0;
            this.command = 0;
        }
        address: number;
        command: number;
        IR_pin: DigitalPin;
    }
    //criar uma classe de recetor IV
    let IR_R = new irReceiver;

    //definir o número máximo de pulsos nec_IR como 33.
    //criar 2 arrays de cache de pulsos.
    let maxPulse: number = 33;
    let low_pulse: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let high_pulse: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    //deve ser definido como 33,
    //caso contrário existe risco de erro ao receber os primeiros dados.
    let LpulseCounter: number = 33;
    let HpulseCounter: number = 33;

    let LpulseTime: number = 0;
    let HpulseTime: number = 0;
    //let pulse9ms: boolean = false;
    //let pulse4ms: boolean = false;
    //Esta variável torna-se verdadeira quando o pulso é repetido
    //let repeatedPulse: boolean = false;

    /**
     * inicializar a função do recetor IV
     */
    function irInit(IR_pin: DigitalPin) {
        pins.onPulsed(IR_pin, PulseValue.Low, () => {      //evento de interrupção
            LpulseTime = pins.pulseDuration();             //medir o pulso
            if (6750 < LpulseTime && LpulseTime < 11250) { //9ms
                LpulseCounter = 0;
            }
            if (LpulseCounter < maxPulse /*&& repeatedPulse == false*/) {
                low_pulse[LpulseCounter] = LpulseTime;
                LpulseCounter += 1;
            }
        });
        pins.onPulsed(IR_pin, PulseValue.High, () => {
            HpulseTime = pins.pulseDuration();
            /*if (1687 < HpulseTime && HpulseTime < 2812) {  //2.25ms
                repeatedPulse = true;
            }*/
            if (3375 < HpulseTime && HpulseTime < 5625) {    //4.5ms
                HpulseCounter = 0;
                //repeatedPulse = false;
            }
            if (HpulseCounter < maxPulse /*&& repeatedPulse == false*/) {
                high_pulse[HpulseCounter] = HpulseTime;
                HpulseCounter += 1;
            }
        });
    }
    /**
    * Função de conversão de pulso em dados
    * author: jieliang mo
    * github:https://github.com/mworkfun
    * Write the date: 2020-6-19
    */
    function irDataProcessing() {
        let tempAddress: number = 0;
        let inverseAddress: number = 0;
        let tempCommand: number = 0;
        let inverseCommand: number = 0;
        let num: number;
        //confirmar pulso de início
        if (6750 < low_pulse[0] && low_pulse[0] < 11250 && HpulseCounter >= 33) {  //9ms
            //converter o pulso em dados
            for (num = 1; num < maxPulse; num++) {
                //if (420 < low_pulse[num] && low_pulse[num] < 700) {      //0.56ms
                if (1267 < high_pulse[num] && high_pulse[num] < 2112) {    //1.69ms = 1, 0.56ms = 0
                    if (1 <= num && num < 9) {    //converter o pulso em endereço
                        tempAddress |= 1 << (num - 1);
                    }
                    if (9 <= num && num < 17) {   //converter o pulso em endereço inverso
                        inverseAddress |= 1 << (num - 9);
                    }
                    if (17 <= num && num < 25) {   //converter o pulso em comando
                        tempCommand |= 1 << (num - 17);
                    }
                    if (25 <= num && num < 33) {   //converter o pulso em comando inverso
                        inverseCommand |= 1 << (num - 25);
                    }
                }
                //}
            }
            low_pulse[0] = 0;
            //verificar os dados e devolvê-los à classe do recetor IV.
            if ((tempAddress + inverseAddress == 0xff) && (tempCommand + inverseCommand == 0xff)) {
                IR_R.address = tempAddress;
                IR_R.command = tempCommand;
                return;
            } else {  //Devolver -1 em caso de erro de verificação.
                IR_R.address = -1;
                IR_R.command = -1;
                return;
            }
        }
        IR_R.address = 0;
        IR_R.command = 0;
    }
    /**
     * Liga ao módulo recetor IV no pino especificado.
     * author: jieliang mo
     * github:https://github.com/mworkfun
     * Write the date: 2020-6-19
     */
    //% blockId="infrared_connect"
    //% block="conectar o recetor IV no %IR_pin"
    //% IR_pin.fieldEditor="gridpicker"
    //% IR_pin.fieldOptions.columns=4
    //% IR_pin.fieldOptions.tooltips="false"
    //% weight=99
    export function connectInfrared(IR_pin: DigitalPin): void {
        IR_R.IR_pin = IR_pin;   //definir o pino de controlo do recetor IV
        pins.setPull(IR_R.IR_pin, PinPullMode.PullUp);
        irInit(IR_R.IR_pin);   //inicializar o recetor IV
    }
    /**
     * Devolve o código de comando de um botão IV específico.
     * author: jieliang mo
     * github:https://github.com/mworkfun
     * Write the date: 2020-6-19
     */
    //% blockId=infrared_button
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.columns=3
    //% button.fieldOptions.tooltips="false"
    //% block="Botão IV %button"
    //% weight=98
    export function irButton(button: IrButton): number {
        return button as number;
    }
    /**
     * Devolve o código do botão IV atualmente premido e 0 se nenhum botão estiver premido.
     * Recomenda-se um atraso de 110ms para ler os dados uma vez
     * author: jieliang mo
     * github:https://github.com/mworkfun
     * Write the date: 2020-6-19
     */
    //% blockId=infrared_pressed_button
    //% block="Botão IV"
    //% weight=97
    export function returnIrButton(): number {
        irDataProcessing();
        basic.pause(80);      //Atraso de um período de receção infravermelha
        return IR_R.command;
    }
}
