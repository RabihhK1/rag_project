import { useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    LayoutPanelTop,
    MessageSquareText,
    SendHorizontal,
    X,
} from "lucide-react";


const steps = [
    {
        target: "sidebar",
        title: "Your conversation workspace",
        description: "Start a new chat here, reopen saved conversations, or review feedback analytics.",
        icon: LayoutPanelTop,
    },
    {
        target: "chatViewport",
        title: "Answers with evidence",
        description: "Responses stream here. Use inline source numbers such as [1] to preview the supporting CIS content.",
        icon: MessageSquareText,
    },
    {
        target: "chatInput",
        title: "Ask a CIS Controls question",
        description: "Send a question to retrieve a grounded answer. After an answer arrives, you can inspect sources, rate it, or regenerate another version.",
        icon: SendHorizontal,
    },
];


function GuidedTour({ isOpen, onComplete, targets }) {
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const cardRef = useRef(null);
    const step = steps[stepIndex];
    const StepIcon = step.icon;
    const isLastStep = stepIndex === steps.length - 1;

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const updateTarget = () => {
            const target = targets[step.target]?.current;
            if (!target) {
                setTargetRect(null);
                return;
            }

            const rect = target.getBoundingClientRect();
            setTargetRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        };

        const timer = window.setTimeout(updateTarget, 0);
        window.addEventListener("resize", updateTarget);
        window.addEventListener("scroll", updateTarget, true);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("resize", updateTarget);
            window.removeEventListener("scroll", updateTarget, true);
        };
    }, [isOpen, step.target, targets]);

    useEffect(() => {
        if (isOpen) {
            cardRef.current?.focus();
        }
    }, [isOpen, stepIndex]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onComplete();
                return;
            }

            if (event.key === "ArrowLeft" && stepIndex > 0) {
                event.preventDefault();
                setStepIndex((current) => current - 1);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                if (isLastStep) {
                    onComplete();
                } else {
                    setStepIndex((current) => current + 1);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLastStep, isOpen, onComplete, stepIndex]);

    if (!isOpen) {
        return null;
    }

    const cardStyle = targetRect
        ? {
            top: (() => {
                const cardHeight = 340;
                const positionBelow = targetRect.top + targetRect.height + 16;

                return positionBelow + cardHeight <= window.innerHeight
                    ? positionBelow
                    : Math.max(16, targetRect.top - cardHeight - 16);
            })(),
            left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 380)),
        }
        : {};

    function nextStep() {
        if (isLastStep) {
            onComplete();
            return;
        }

        setStepIndex((current) => current + 1);
    }

    return (
        <div className="guided-tour" role="presentation">
            <div className="tour-ambient" aria-hidden="true" />
            {targetRect && (
                <div
                    className="tour-spotlight"
                    style={{
                        top: targetRect.top - 6,
                        left: targetRect.left - 6,
                        width: targetRect.width + 12,
                        height: targetRect.height + 12,
                    }}
                />
            )}

            <section
                key={stepIndex}
                ref={cardRef}
                className="tour-card"
                style={cardStyle}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tour-title"
                aria-describedby="tour-description"
                tabIndex="-1"
            >
                <div className="tour-card-header">
                    <div className="tour-step-icon" aria-hidden="true">
                        <StepIcon size={20} />
                    </div>
                    <button
                        type="button"
                        className="tour-close"
                        onClick={onComplete}
                        aria-label="Close guided tour"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>

                <div className="tour-progress-row">
                    <span className="tour-progress">
                        Step {stepIndex + 1} of {steps.length}
                    </span>
                    <span className="tour-progress-label">Quick tour</span>
                </div>
                <div className="tour-progress-track" aria-hidden="true">
                    <span style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
                </div>

                <h2 id="tour-title">{step.title}</h2>
                <p id="tour-description">{step.description}</p>
                <p className="tour-keyboard-hint">
                    Use <kbd>←</kbd> and <kbd>→</kbd> to move through the tour.
                </p>

                <div className="tour-actions">
                    <button type="button" className="tour-skip" onClick={onComplete}>
                        Skip tour
                    </button>
                    <div>
                        <button
                            type="button"
                            className="tour-back"
                            onClick={() => setStepIndex((current) => current - 1)}
                            disabled={stepIndex === 0}
                        >
                            <ArrowLeft size={15} aria-hidden="true" />
                            Back
                        </button>
                        <button type="button" className="tour-next" onClick={nextStep}>
                            {isLastStep ? (
                                <>
                                    <Check size={16} aria-hidden="true" />
                                    Let&apos;s go
                                </>
                            ) : (
                                <>
                                    Next
                                    <ArrowRight size={16} aria-hidden="true" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}


export default GuidedTour;
