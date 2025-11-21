import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Step, ReactType } from "./global.types.ts"
import useTourNavigate from "./hooks/useTourNavigate.js";
import styles from "./global.styles.module.css";

const safeRead = (key: string) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

const safeWrite = (key: string, value: unknown) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        return null;
    }
}

type TourContextType = {
    step: number;
    steps: Step[];
    setStep?: React.Dispatch<React.SetStateAction<number>>;
    doneTour?: boolean;
    id?: string;
    setDoneTour?: React.Dispatch<React.SetStateAction<boolean>>;
}

type TourPopupProps = {
    passedStep: number;
    children: React.ReactNode;
    left?: number;
    top?: number;
    nextHandler?: () => void;
    finishHandler?: () => void;
    backHandler?: () => void;
}

type TourProps = {
    steps: Step[];
    children: React.ReactNode;
    id: string;
}

interface TourButtonInterface {
    onClick: (() => void) | undefined;
    children: React.ReactNode;
}

type HighlighterProps = {
    children: React.ReactNode;
    passedStep: number;
}

export const TourContext = createContext<TourContextType>({
    step: -1,
    steps: [],
});


export default function Tour({ steps, children, id }: TourProps) {

    const [step, setStep] = useState(0);
    const [doneTour, setDoneTour] = useState(false);

    useEffect(() => {
        const val = safeRead(`tour-${id}`);
        if (val) {
            setDoneTour(val.doneTour);
            setStep(val.step ?? 0);
        }
        else safeWrite(`tour-${id}`, {
            doneTour: false,
            step: 0,
        });
    }, [id])

    return (
        <TourContext.Provider value={{ step, setStep, steps, doneTour, id, setDoneTour }}>
            {children}
        </TourContext.Provider >
    )
}


export function TourPopup({ passedStep, children, left = 0, top = 0, nextHandler, finishHandler, backHandler }: TourPopupProps): React.ReactNode {

    const { steps, step, doneTour } = useContext(TourContext);

    if (doneTour) return null;


    if (step !== passedStep) return null;


    if (!children)
        return (
            <article className={`${styles.tourPopup} ${styles.tourPopupDefault} ${styles.popups}`} style={{ top, left }}>
                <h3>{steps[step]?.title ?? "Title"}</h3>
                <p>{steps[step]?.content ?? "Content"}</p>
                <div className={styles.popupButtonContainer}>
                    <TourButtonBack onClick={backHandler}>back</TourButtonBack>
                    {step === steps.length - 1 ? <TourButtonFinish onClick={finishHandler}>finish</TourButtonFinish> : <TourButtonNext onClick={nextHandler}>next</TourButtonNext>}
                </div>
            </article>
        )

    return <div className={`${styles.tourPopup}`} style={{ top, left }}>{children}</div>
}


export function TourButtonNext({ onClick: handler, children }: TourButtonInterface) {

    const { steps, setStep, step, id, setDoneTour } = useContext(TourContext);

    const handleClick = () => {
        if (handler) handler();
        setStep?.(p => {
            const val = safeRead(`tour-${id}`) ?? { step: p, doneTour: false };
            val.step = p + 1;
            safeWrite(`tour-${id}`, val);
            return p + 1
        })
        if (step === steps.length - 1) {
            const val = safeRead(`tour-${id}`) ?? { step: step, doneTour: false };
            val.doneTour = true;
            safeWrite(`tour-${id}`, val);
            setDoneTour?.(true);
        }
    }

    return (

        <button className={styles.tourButton} disabled={step === steps.length - 1} onClick={handleClick} >
            {children}
        </button>

    )
}



export function TourButtonBack({ onClick: handler, children }: TourButtonInterface) {

    const { setStep, step, id } = useContext(TourContext);

    const handleClick = () => {
        if (handler) handler();
        setStep?.(p => {
            const val = safeRead(`tour-${id}`) ?? { step: p, doneTour: false };
            val.step = p - 1;
            safeWrite(`tour-${id}`, val);
            return p - 1
        })
    }


    return (
        <button className={styles.tourButton} disabled={step === 0} onClick={handleClick}>
            {children}
        </button>
    )

}


export function TourButtonFinish({ onClick: handler, children }: TourButtonInterface) {

    const { id, setDoneTour } = useContext(TourContext);

    const handleClick = () => {
        if (handler) handler();
        const val = safeRead(`tour-${id}`) ?? { step: 0, doneTour: false };
        val.doneTour = true;
        safeWrite(`tour-${id}`, val);
        setDoneTour?.(true);
    }

    return (
        <button className={styles.tourButton} onClick={handleClick}>
            {children}
        </button>
    )

}

export function Title() {
    const { steps, step } = useContext(TourContext);
    return <span>{steps[step]?.title ?? "Title"}</span>
}


export function Content() {
    const { steps, step } = useContext(TourContext);
    return <span>{steps[step]?.content ?? "Content"}</span>
}



export function TourRoute({ children }: { children: React.ReactNode }) {

    const { id } = useContext(TourContext);
    const [isWrongOrder, setIsWrongOrder] = useState(false);
    const { navigateTour } = useTourNavigate();
    useEffect(() => {
        if (!JSON.parse(localStorage.getItem(`tour-${id}`) ?? "")) return;
        const { doneTour, route } = JSON.parse(localStorage.getItem(`tour-${id}`) ?? "");
        console.log(route);
        if (!route) return;
        if (!doneTour && route !== window.location.pathname) {
            console.log("wrong route")
            setIsWrongOrder(true);
        }
    }, [id])


    return (
        <>
            {isWrongOrder &&
                <div className={styles.wrongOrderContainer}>
                    <div className={styles.wrongOrderButtonContainer}>
                        <h3>Tour</h3>
                        <p>Do you want to pick up where you left??</p>
                        <div className={styles.wrongOrderButtonContainer}>
                            <button onClick={() => {
                                setIsWrongOrder(false);
                                navigateTour((JSON.parse(localStorage.getItem(`tour-${id}`) ?? "")).route)
                            }} className={styles.wrongOrderButton}>resume</button>
                            <button onClick={() => {
                                setIsWrongOrder(false);
                            }} className={styles.wrongOrderButton}>exit</button>
                        </div>
                    </div>
                </div>}
            {children}
        </>
    )
}


export function Highlighter({ children, passedStep }: HighlighterProps) {

    const { step, doneTour } = useContext(TourContext);

    const elemRef = useRef<HTMLDivElement | null>(null);


    const [rect, setRect] = useState<null | ReactType>(null);

    useEffect(() => {
        const compute = () => {
            if (!elemRef.current) return setRect(null);
            const r = elemRef.current!.getBoundingClientRect();
            setRect({
                top: Math.round(r.top + window.scrollY),
                left: Math.round(r.left + window.scrollX),
                width: Math.round(r.width),
                height: Math.round(r.height),
                right: Math.round(r.right + window.scrollX),
                bottom: Math.round(r.bottom + window.scrollY)
            });
        }

        if (step === passedStep) {
            compute();
            window.addEventListener('resize', compute);
            window.addEventListener('scroll', compute, true);
        }

        return () => {
            window.removeEventListener('resize', compute);
            window.removeEventListener('scroll', compute, true);
        }
    }, [step, passedStep]);

    if (step === passedStep && rect && !doneTour) {
        return (
            <div style={{ position: 'relative', zIndex: 70, width: "fit-content", height: "fit-content" }} ref={elemRef}>
                <div style={{ position: 'relative', zIndex: 71 }}>
                    {children}
                </div>

                <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'auto' }}>
                    <div className={`${styles.overlay}`} style={{ position: 'absolute', left: 0, top: 0, right: 0, height: rect.top, background: 'rgba(0,0,0,0.6)' }} />
                    <div className={`${styles.overlay}`} style={{ position: 'absolute', left: 0, top: rect.top, width: rect.left, height: rect.height, background: 'rgba(0,0,0,0.6)' }} />
                    <div className={`${styles.overlay}`} style={{ position: 'absolute', left: rect.left + rect.width, top: rect.top, right: 0, height: rect.height, background: 'rgba(0,0,0,0.6)' }} />
                    <div className={`${styles.overlay}`} style={{ position: 'absolute', left: 0, top: rect.top + rect.height, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)' }} />
                </div>
                <div style={{ position: 'fixed', top: rect.top, left: rect.left, width: rect.width, height: rect.height, boxShadow: '0 0 0 3px rgba(255,255,255,0.9)', borderRadius: 6, pointerEvents: 'none', zIndex: 72 }} />
            </div>
        )
    }

    return (
        <div style={{ width: "fit-content", height: "fit-content" }} ref={elemRef}>
            {children}
        </div>
    )
}

