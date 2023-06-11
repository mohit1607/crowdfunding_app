import React from 'react'

const CustomButton = ({
  title,
  handleClick,
  btnType,
  styles
}) => {
  return (
    <button onClick={handleClick} type={btnType} className={`${styles} font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px]`}>
        {title}
    </button>
  )
}

export default CustomButton