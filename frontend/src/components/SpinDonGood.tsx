"use client";

import styled from "@emotion/styled";

const Dongood = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    animation: scale ease-in-out infinite 3s;

    @keyframes scale {
        0% {
            transform: scale(0.6);
        }
        10% {
            transform: scale(0.6);
        }

        25% {
            transform: scale(0.3);
        }

        40% {
            transform: scale(0.65);
        }
        50% {
            transform: scale(0.6);
        }
        60% {
            transform: scale(0.6);
        }

        75% {
            transform: scale(0.3);
        }
        90% {
            transform: scale(0.65);
        }
        100% {
            transform: scale(0.6);
        }
    }
`;

const Don = styled.div`
    width: 175px;
    height: 225px;
    animation: rotate infinite 3s;

    @keyframes rotate {
        0%,
        10% {
            transform: rotate(0);
        }

        40%,
        60% {
            transform: rotate(540deg);
        }
        90%,
        100% {
            transform: rotate(0);
        }
    }
`;

const Don2 = styled.div`
    width: 35px;
    height: 15px;
    background-color: var(--grey800);
    animation: good1 ease-in-out infinite 3s;

    @keyframes good1 {
        0%,
        20% {
            transform: translateX(0);
        }

        25%,
        70% {
            transform: translateX(140px);
        }

        75%,
        100% {
            transform: translateX(0);
        }
    }
`;

const Don1 = styled.div`
    width: 175px;
    height: 35px;
    background-color: var(--grey800);
    transform: scaleY(1.05);
    border-radius: 5px 5px 0 0;
`;

const Don3 = styled.div`
    width: 175px;
    height: 35px;
    background-color: var(--grey800);
    transform: scaleY(1.05);
    margin-bottom: 15px;
`;

const Don4 = styled.div`
    width: 35px;
    height: 15px;
    background-color: var(--grey800);
    margin-left: 70px;
`;

const Don5 = styled.div`
    width: 175px;
    height: 35px;
    background-color: var(--grey800);
    transform: scaleY(1.05);
    margin-bottom: 15px;
`;

const Don6 = styled.div`
    width: 35px;
    height: 15px;
    background-color: var(--grey800);
`;

const Don7 = styled.div`
    width: 175px;
    height: 35px;
    background-color: var(--grey800);
    transform: scaleY(1.05);
    border-radius: 0 0 5px 5px;
`;

export default function SpinDonGood() {
    return (
        <Dongood>
            <Don>
                <Don1></Don1>
                <Don2></Don2>
                <Don3></Don3>
                <Don4></Don4>
                <Don5></Don5>
                <Don6></Don6>
                <Don7></Don7>
            </Don>
        </Dongood>
    );
}
