import react, { useContext, createContext } from "react";
import { useContract, useMetamask, useContractWrite, useAddress } from '@thirdweb-dev/react'
import { ethers } from "ethers";
// import { createCampaign } from "../assets/assets";

const StateContext = createContext()

export const StateContextProvider = ({ children }) => {
    const { contract } = useContract('0xA79a53b0901D6F48D735682C07f43d85F3899077')
    const { mutateAsync: CreateCampaign } = useContractWrite(contract, 'CreateCampaign')   // createCampaign is alias
    const address = useAddress()
    const connect = useMetamask()

    // functions 
    const publishCampaign = async (form) => {
        try {
            const data = await CreateCampaign({
                args: [ // order of args must match the fucntion of smartContract. 
                    address,
                    form.title,
                    form.description,
                    form.target, // target price
                    new Date(form.deadline).getTime(), // deadline
                    form.image
                ]
            }) // this also works

            // const data = await contract.call("CreateCampaign", [address,
            //     form.title,
            //     form.description,
            //     form.target,
            //     new Date(form.deadline).getTime(),
            //     form.image])   // success
            console.log('Contract call success', data)
        } catch (error) {
            console.log('Contract call failed', error)
        }
    }

    const getCampaigns = async () => {
        const campaigns = await contract.call('getCampaigns')
        // console.log(campaigns)
        // parsing all the  campaigns into more human readable format.
        const parsedCampaigns = campaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
            image: campaign.image,
            pId: i
        }))
        // console.log(parsedCampaigns)
        return parsedCampaigns
    }

    const getUserCampaigns = async () => {
        const allCampaigns = await getCampaigns()
        const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address)
        return filteredCampaigns
    }

    const donate = async (pId, amount) => {
        const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount) });
        return data;
    }

    const getDonations = async (pId) => {
        const donations = await contract.call('getDonators', [pId]);
        const numberOfDonations = donations[0].length;

        const parsedDonations = [];

        for (let i = 0; i < numberOfDonations; i++) {
            parsedDonations.push({
                donator: donations[0][i],
                donation: ethers.utils.formatEther(donations[1][i].toString())
            })
        }

        return parsedDonations;
    }

    return (
        <StateContext.Provider value={{
            address,
            connect,
            contract,
            createCampaign: publishCampaign,
            getCampaigns,
            getUserCampaigns,
            donate,
            getDonations,
        }}>
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext)