import React from 'react';
import {ReactComponent as SvgClose} from '../assets/images/close.svg';

export default class HelpModalComponent extends React.Component {
	constructor(props) {
		super(props);
		const {helpModalWrapper, helpModalInner} = props;
		this.state = {helpModalWrapper, helpModalInner};
	}

	componendividMount() {
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		['helpModalWrapper', 'helpModalInner'].forEach(stateKey => {
			if (this.state[stateKey] !== nextProps[stateKey]) {
				this.setState({[stateKey]:nextProps[stateKey]}, e=> { });
			}
		});
	}

	render() {
		const {helpModalWrapper, helpModalInner} = this.state;
		return (
			<div className={`help-modal modal-back ${helpModalWrapper?'active':''}`}>
				<div className={`modal-wrapper ${helpModalInner?'active':''}`}>
					<div className='help-title modal-title'>Help</div>
					<div className='modal-content scroll scroll-y'>
						<div className='help-item'>
							<div className='help-title'>Sump tank</div>
							<div className='help-info'>
								<div className='help-value'> - Sump Tank under the system surface 30 cm bellow the ground level.</div>
								<div className='help-value'> - Sump Tank can be placed anywhere</div>
								<div className='help-value'> - Can be rotated horizontally by 90, 180 or 270 degrees.</div>
								<div className='help-value'> - The diameter is always 1.6 meters.</div>
								<div className='help-value'> - Minimum length is 80 cm for the initial 3 MBGBs.</div>
								<div className='help-value'> - Each additional MBGB should add 10cm to the sump tank length (cylinder height)</div>
							</div>
						</div>

						<div className='help-item'>
							<div className='help-title'>Fish tank (FT)</div>
							<div className='help-info'>
								<div className='help-value'> - Fish tank installed at the ground level inside the greenhouse.</div>
								<div className='help-value'> - Cylinder diameter=2.5 m, height=1.7 m</div>
								<div className='help-value'> - FT amounts Min 1 maximum 4</div>
								<div className='sub-wrapper'>
									<div className='sub-item'><div className='point'></div>1 FT  100㎡ to 249 ㎡; from 1 to 2 filters</div>
									<div className='sub-item'><div className='point'></div>2 FTs 250㎡ to 499 ㎡; from 3 to 4 filters</div>
									<div className='sub-item'><div className='point'></div>3 FTs 500㎡ to 749 ㎡; from 5 to 6 filters</div>
									<div className='sub-item'><div className='point'></div>4 FTs 750㎡ to 1000 ㎡; from 7 to 8 filters</div>
								</div>
							</div>
						</div>
						
						<div className='help-item'>
							<div className='help-title'>Filter</div>
							<div className='help-info'>
								<div className='help-value'> - Cylinder diameter=1.3m, height=1.3m</div>
								<div className='help-value'> - Minimum 1 item maximum 8 items.</div>
								<div className='help-value'> - For each additional 125㎡ of grow surface surface the mandatory element add 1 additional filter.</div>
							</div>
						</div>

						<div className='help-item'>
							<div className='help-title'>MBGB</div>
							<div className='help-info'>
								<div className='help-value'> - 3㎡ of grow surface Raised to waist level on concrete blocks</div>
								<div className='help-value'> - Bottom of MBGB is minimum 50 cm from ground level</div>
								<div className='help-value'> - Size 3m x 1m x 0.35m</div>
								<div className='help-value'> - Configuration</div>
								<div className='sub-wrapper'>
									<div className='sub-item'><div className='point'></div>Minimum 3 MBGB per 1 Fish tank in any configuration</div>
									<div className='sub-item'><div className='point'></div>Minimum 1 MBGB per 4 NFT units in any configuration</div>
									<div className='sub-item'><div className='point'></div>Minimum 1 MBGB per 65㎡ of DWC grow surface</div>
								</div>
							</div>
						</div>

						<div className='help-item'>
							<div className='help-title'>DWC</div>
							<div className='help-info'>
								<div className='help-value'> - The DWC surface is equal to grow surface Minimum 4.5㎡ of DWC surface per single object if selected in any configuration.</div>
								<div className='help-value'> - Can change width and length in selected option</div>
							</div>
						</div>

						<div className='help-item'>
							<div className='help-title'>NFT</div>
							<div className='help-info'>
								<div className='help-value'> - 12㎡ of grow surface</div>
								<div className='help-value'> - Size 3 m length, 0.8 m wide and 1.8m Hight</div>
								<div className='help-value'> - For 4 NFT units 1 MBGB is mandatory</div>
							</div>
						</div>

						<div className='help-item'>
							<div className='help-title'>System configuration with the sump tank</div>
							<div className='help-info'>
								<div className='help-value'> - There are no limitations on which type of plant growing method (NFT, DWC or MBGB) is chosen other than sufficient filtration capacity of MBGB</div>
								<div className='help-value'> - Mandatory elements are 1 Sump tank, 1 filter, 3 MBGB and 1  FT.</div>
								<div className='help-value'> - Once the number of optional elements surpasses the biological sustainment rate (One FT can sustain up to 200㎡ of DWC, One FT can sustain up to 12 NFT units) in any configuration the additional number of FTs and filters should be displayed as mandatory.</div>
								<div className='help-value'> - Optional elements are NFTs, DWCs, additional MBGBs</div>
							</div>
						</div>

						<div className='help-item'>
							<div className='help-title'>System configuration without a sump tank</div>
							<div className='help-info'>
								<div className='help-value'> - DWC is mandatory - minimum 4.5㎡ </div>
								<div className='help-value'> - DWC has to be placed as a single element that is stretchable which can cover the corridor space, could be placed in increments of 80 cm, 70 cm and 1 m to align with rows of other elements</div>
								<div className='help-value'> - DWC can be placed only  adjacently to the MBGB row and each additional MBGB on top of 3 mandatory MBGBs for each system  requires additional 1.5㎡ of DWC </div>
								<div className='help-value'> - Mandatory elements are at least 4.5 m2 of DWC plus 1.5m2 of DWC for each additional MBGB, 1 FT and 1 filter</div>
								<div className='help-value'> - Optional elements are additional MBGBs additional DWCs, additional NFTs</div>
							</div>
						</div>

					</div>
					<div className='close-icon flex' onClick={()=>this.props.closeHelpModal()}><SvgClose></SvgClose></div>
				</div>
			</div>
		);
	}
}
