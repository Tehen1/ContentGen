from flask import Blueprint, request, jsonify
from web3 import Web3
from routes.auth_routes import token_required
from web3.contracts import contract_manager
from models.user import User
from models.activity import Activity

bp = Blueprint('web3', __name__)

@bp.route('/nfts', methods=['GET'])
@token_required
def get_user_nfts():
    """Get all NFTs owned by the current user"""
    user = request.current_user
    
    # Check if user has a connected wallet
    if not user.wallet or not user.wallet.address:
        return jsonify({'message': 'No wallet connected to this account'}), 400
    
    try:
        # Get NFTs from the blockchain
        nfts = contract_manager.get_user_nfts(user.wallet.address)
        
        # Get activities associated with these NFTs
        activities = []
        activity_ids = []
        
        for nft in nfts:
            activity = Activity.objects(nft_token_id=nft['token_id']).first()
            if activity and str(activity.user_id) == str(user.id):
                activities.append(activity.to_dict())
                activity_ids.append(str(activity.id))
        
        # For NFTs without an associated activity, we still include them
        orphaned_nfts = [nft for nft in nfts if nft['token_id'] not in activity_ids]
        
        return jsonify({
            'nfts': nfts,
            'activities': activities,
            'orphaned_nfts': orphaned_nfts,
            'total': len(nfts)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error retrieving NFTs: {str(e)}'}), 500

@bp.route('/verify-wallet', methods=['POST'])
@token_required
def verify_wallet():
    """Verify ownership of a wallet by checking a signed message"""
    user = request.current_user
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['address', 'message', 'signature']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    try:
        # Recover the address from the signature
        web3 = Web3()
        message = data['message']
        signature = data['signature']
        
        # Create a message hash that follows Ethereum's personal_sign format
        message_hash = web3.keccak(text=f"\x19Ethereum Signed Message:\n{len(message)}{message}")
        
        # Recover the address that signed the message
        recovered_address = web3.eth.account.recover_message(
            message_hash=message_hash,
            signature=signature
        )
        
        # Check if the recovered address matches the provided address
        if recovered_address.lower() != data['address'].lower():
            return jsonify({'message': 'Invalid signature'}), 400
        
        # Check if wallet is already connected to another account
        existing_user = User.get_by_wallet(data['address'])
        if existing_user and str(existing_user.id) != str(user.id):
            return jsonify({'message': 'Wallet already connected to another account'}), 400
        
        # Connect wallet to user account
        user.connect_wallet(
            address=data['address'],
            chain_id=data.get('chain_id', 1)
        )
        
        return jsonify({
            'message': 'Wallet verified and connected successfully',
            'user': user.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'message': f'Invalid signature: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'message': f'Error verifying wallet: {str(e)}'}), 500

@bp.route('/network-status', methods=['GET'])
def get_network_status():
    """Get blockchain network status"""
    try:
        web3 = contract_manager.web3
        
        # Get network information
        network_info = {
            'connected': web3.is_connected(),
            'chain_id': web3.eth.chain_id,
            'latest_block': web3.eth.block_number,
            'gas_price': web3.from_wei(web3.eth.gas_price, 'gwei'),
        }
        
        return jsonify(network_info), 200
        
    except Exception as e:
        return jsonify({'message': f'Error getting network status: {str(e)}'}), 500

@bp.route('/mint-status/<tx_hash>', methods=['GET'])
@token_required
def get_mint_status(tx_hash):
    """Get status of an NFT minting transaction"""
    try:
        web3 = contract_manager.web3
        
        # Get transaction receipt
        receipt = web3.eth.get_transaction_receipt(tx_hash)
        
        if not receipt:
            return jsonify({
                'tx_hash': tx_hash,
                'status': 'pending',
                'message': 'Transaction is still pending'
            }), 200
        
        # Check transaction status
        if receipt.status == 1:
            # Transaction was successful
            # Find the activity this transaction belongs to
            activity = Activity.objects(nft_token_id=tx_hash).first()
            
            result = {
                'tx_hash': tx_hash,
                'status': 'confirmed',
                'block_number': receipt.blockNumber,
                'gas_used': receipt.gasUsed,
            }
            
            if activity:
                result['activity_id'] = str(activity.id)
                
            return jsonify(result), 200
        else:
            # Transaction failed
            return jsonify({
                'tx_hash': tx_hash,
                'status': 'failed',
                'message': 'Transaction failed'
            }), 200
            
    except Exception as e:
        return jsonify({'message': f'Error getting mint status: {str(e)}'}), 500