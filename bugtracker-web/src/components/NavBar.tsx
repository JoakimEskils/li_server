import React from 'react'

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    return (
        <div>
            <div>Detta ar en navbar LOGIN link</div>
            <div>Detta ar en navbar REGISTER link</div>
            <div>logout link</div>
        </div>
    )
}